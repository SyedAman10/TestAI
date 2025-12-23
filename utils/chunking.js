import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { estimateTokens, calculateAvailableContextTokens, truncateToTokenLimit } from './tokenEstimator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgeBaseDir = path.join(__dirname, '..', 'knowledge-base');

/**
 * Split text into chunks by paragraphs/sections with position tracking
 * @param {string} text - The text to chunk
 * @param {number} maxChunkSize - Maximum characters per chunk (reduced for token safety)
 * @returns {Array<Object>} Array of chunk objects with content and position info
 */
export function chunkText(text, maxChunkSize = 600) {
  const chunks = [];
  
  // Split by double newlines (paragraphs) first
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  let chunkStartPosition = 0;
  let currentPosition = 0;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    if (!trimmedParagraph) {
      currentPosition += paragraph.length + 2; // Account for newlines
      continue;
    }
    
    // If adding this paragraph would exceed max size, save current chunk and start new one
    if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        startChar: chunkStartPosition,
        endChar: currentPosition,
        preview: currentChunk.trim().substring(0, 80) + '...'
      });
      currentChunk = trimmedParagraph;
      chunkStartPosition = currentPosition;
    } else {
      // Add to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
    }
    
    currentPosition += paragraph.length + 2; // Account for newlines
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      startChar: chunkStartPosition,
      endChar: currentPosition,
      preview: currentChunk.trim().substring(0, 80) + '...'
    });
  }
  
  return chunks;
}

/**
 * Score chunks based on keyword relevance to the query
 * @param {string} chunk - Text chunk to score
 * @param {string} query - User's question
 * @returns {number} Relevance score
 */
export function scoreChunkRelevance(chunk, query) {
  const chunkLower = chunk.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Extract keywords from query (remove common words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 
    'where', 'who', 'which', 'can', 'could', 'should', 'would', 'do', 'does', 
    'did', 'have', 'has', 'had', 'my', 'i', 'me', 'you', 'about', 'tell', 'explain'
  ]);
  
  const queryWords = queryLower
    .split(/\W+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  let score = 0;
  
  // Score based on keyword matches
  for (const word of queryWords) {
    // Count occurrences of this keyword
    const regex = new RegExp(word, 'gi');
    const matches = chunkLower.match(regex);
    if (matches) {
      // Higher score for exact matches, even more for multiple occurrences
      score += matches.length * 10;
    }
    
    // Bonus for keyword appearing in first 200 characters (likely more relevant)
    if (chunkLower.substring(0, 200).includes(word)) {
      score += 5;
    }
  }
  
  return score;
}

/**
 * Get most relevant chunks from documents based on user query
 * @param {string} query - User's question
 * @param {number} topK - Number of top chunks to return (reduced to 3)
 * @param {number} maxChunkSize - Maximum size per chunk (reduced to 600)
 * @returns {Object} Combined relevant context and metadata
 */
export function getRelevantContext(query, topK = 3, maxChunkSize = 600) {
  const files = fs.readdirSync(knowledgeBaseDir);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 RAG EXTRACTION - Query: "${query.substring(0, 50)}..."`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📁 Files in knowledge base: ${files.length}`);
  
  if (files.length === 0) {
    console.log('❌ No files found in knowledge base!');
    return { context: '', tokenCount: 0, chunksUsed: 0 };
  }
  
  const allChunks = [];
  
  // Process each file
  for (const file of files) {
    const filePath = path.join(knowledgeBaseDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`\n📄 Processing: ${file}`);
    console.log(`   • File size: ${content.length} characters`);
    
    // Chunk the document with position tracking
    const chunks = chunkText(content, maxChunkSize);
    console.log(`   • Created ${chunks.length} chunks (${maxChunkSize} chars each)`);
    
    // Score each chunk
    let scoredChunks = 0;
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const score = scoreChunkRelevance(chunk.content, query);
      if (score > 0) {
        allChunks.push({
          content: chunk.content,
          score: score,
          filename: file,
          tokens: estimateTokens(chunk.content),
          startChar: chunk.startChar,
          endChar: chunk.endChar,
          chunkIndex: idx + 1,
          totalChunks: chunks.length,
          preview: chunk.preview
        });
        scoredChunks++;
      }
    }
    console.log(`   • Chunks with relevance score > 0: ${scoredChunks}`);
  }
  
  // Sort by score and take top K
  allChunks.sort((a, b) => b.score - a.score);
  
  console.log(`\n🎯 Relevance Scoring Complete:`);
  console.log(`   • Total chunks with score > 0: ${allChunks.length}`);
  if (allChunks.length > 0) {
    console.log(`   • Top 5 scores: ${allChunks.slice(0, 5).map(c => c.score).join(', ')}`);
  }
  
  // Build context string within token limits
  let context = '\n\n=== RELEVANT THERAPEUTIC RESOURCES & PROTOCOLS ===\n';
  let totalTokens = estimateTokens(context);
  const availableTokens = calculateAvailableContextTokens();
  const selectedChunks = [];
  
  console.log(`\n🔢 Token Budget:`);
  console.log(`   • Available tokens: ${availableTokens}`);
  console.log(`   • Header tokens: ${totalTokens}`);
  console.log(`   • Selecting top ${topK} chunks...`);
  
  for (let i = 0; i < Math.min(topK, allChunks.length); i++) {
    const chunk = allChunks[i];
    const chunkHeader = `\n--- Excerpt ${i + 1} from ${chunk.filename} (Relevance: ${chunk.score}) ---\n`;
    const chunkTokens = chunk.tokens + estimateTokens(chunkHeader);
    
    console.log(`\n   📄 Chunk ${i + 1}:`);
    console.log(`      • File: ${chunk.filename}`);
    console.log(`      • Position: Chunk ${chunk.chunkIndex}/${chunk.totalChunks}`);
    console.log(`      • Character Range: ${chunk.startChar}-${chunk.endChar}`);
    console.log(`      • Preview: "${chunk.preview}"`);
    console.log(`      • Score: ${chunk.score}`);
    console.log(`      • Tokens: ${chunkTokens}`);
    console.log(`      • Current total: ${totalTokens}`);
    console.log(`      • Would be: ${totalTokens + chunkTokens}`);
    
    // Check if adding this chunk would exceed token limit
    if (totalTokens + chunkTokens > availableTokens) {
      console.log(`      ❌ SKIPPED - Would exceed limit (${totalTokens + chunkTokens} > ${availableTokens})`);
      break;
    }
    
    console.log(`      ✅ ADDED`);
    context += chunkHeader + chunk.content + '\n';
    totalTokens += chunkTokens;
    selectedChunks.push(chunk);
  }
  
  // Final safety check - truncate if still too large
  if (totalTokens > availableTokens) {
    console.log(`\n⚠️  Context too large (${totalTokens} tokens), truncating to ${availableTokens}`);
    context = truncateToTokenLimit(context, availableTokens);
    totalTokens = availableTokens;
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ RAG COMPLETE: ${selectedChunks.length} chunks, ~${totalTokens} tokens`);
  console.log(`📍 Sources Used:`);
  selectedChunks.forEach((chunk, idx) => {
    console.log(`   ${idx + 1}. ${chunk.filename} [Chunk ${chunk.chunkIndex}/${chunk.totalChunks}, Chars ${chunk.startChar}-${chunk.endChar}]`);
  });
  console.log(`${'='.repeat(60)}\n`);
  
  return {
    context: context || '',
    tokenCount: totalTokens,
    chunksUsed: selectedChunks.length,
    sources: selectedChunks.map(c => ({
      filename: c.filename,
      chunkIndex: c.chunkIndex,
      totalChunks: c.totalChunks,
      startChar: c.startChar,
      endChar: c.endChar,
      preview: c.preview
    }))
  };
}

