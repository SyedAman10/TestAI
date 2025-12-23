import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { getRelevantContext } from '../utils/chunking.js';
import { THERAPY_SYSTEM_PROMPT } from '../config/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const knowledgeBaseDir = path.join(__dirname, '..', 'knowledge-base');

/**
 * Therapy Chat endpoint - Main therapeutic conversation
 */
router.post('/chat', async (req, res) => {
  try {
    const { 
      message, 
      session_context = '',
      max_tokens = 800, 
      temperature = 0.7, 
      provider = 'auto' 
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: THERAPY_SYSTEM_PROMPT
      }
    ];

    // Add session context if provided
    if (session_context) {
      messages.push({
        role: 'system',
        content: `Session Context: ${session_context}`
      });
    }

    messages.push({
      role: 'user',
      content: message
    });

    const client = req.app.get('inferenceClient');
    const response = await client.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      provider: provider,
      messages: messages,
      max_tokens: max_tokens,
      temperature: temperature
    });

    res.json({
      success: true,
      response: response.choices[0].message.content,
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      disclaimer: 'This is not medical advice. Please consult with your healthcare provider.'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing your request'
    });
  }
});

/**
 * Chat with uploaded documents (RAG with smart chunking)
 */
router.post('/chat-with-docs', async (req, res) => {
  try {
    const { 
      message, 
      use_knowledge_base = true,
      max_tokens = 1000, 
      temperature = 0.7,
      provider = 'auto',
      top_chunks = 3  // Reduced from 5 to 3 for token safety
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: THERAPY_SYSTEM_PROMPT
      }
    ];

    let chunksUsed = 0;
    let contextTokens = 0;
    let sources = [];
    
    // Use smart chunking to get only relevant content
    if (use_knowledge_base) {
      const files = fs.readdirSync(knowledgeBaseDir);
      if (files.length > 0) {
        // getRelevantContext now returns { context, tokenCount, chunksUsed, sources }
        const { context, tokenCount, chunksUsed: chunks, sources: sourcesData } = getRelevantContext(message, top_chunks);
        
        if (context) {
          messages.push({
            role: 'system',
            content: context
          });
          
          chunksUsed = chunks;
          contextTokens = tokenCount;
          sources = sourcesData || [];
        }
      }
    }

    messages.push({
      role: 'user',
      content: message
    });

    const client = req.app.get('inferenceClient');
    const response = await client.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      provider: provider,
      messages: messages,
      max_tokens: max_tokens,
      temperature: temperature
    });

    res.json({
      success: true,
      response: response.choices[0].message.content,
      knowledge_base_used: use_knowledge_base,
      documents_count: use_knowledge_base ? fs.readdirSync(knowledgeBaseDir).length : 0,
      chunks_used: chunksUsed,
      context_tokens: contextTokens,
      method: 'smart_chunking_v2',
      sources: sources,
      disclaimer: 'This is not medical advice. Please consult with your healthcare provider.'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * File Upload endpoint - Upload therapy resources, protocols, etc.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let fileContent;
    const isPDF = req.file.originalname.toLowerCase().endsWith('.pdf');
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📤 FILE UPLOAD: ${req.file.originalname}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Type: ${isPDF ? 'PDF' : 'Text'}`);
    console.log(`Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    
    // Handle PDF files differently
    if (isPDF) {
      console.log('🔄 Extracting text from PDF...');
      const dataBuffer = fs.readFileSync(req.file.path);
      fileContent = await extractTextFromPDF(dataBuffer);
      console.log(`✅ Extracted ${fileContent.length} characters`);
    } else {
      // Handle text files
      fileContent = fs.readFileSync(req.file.path, 'utf-8');
      console.log(`✅ Read ${fileContent.length} characters`);
    }
    
    // Save to knowledge base
    const knowledgeFile = path.join(knowledgeBaseDir, req.file.originalname + '.txt');
    fs.writeFileSync(knowledgeFile, fileContent);
    console.log(`💾 Saved to knowledge base: ${path.basename(knowledgeFile)}`);
    console.log(`${'='.repeat(60)}\n`);

    res.json({
      success: true,
      message: 'File uploaded and added to knowledge base',
      filename: req.file.originalname,
      size: req.file.size,
      extracted_text_length: fileContent.length,
      knowledge_base_file: path.basename(knowledgeFile),
      path: req.file.path,
      type: isPDF ? 'pdf' : 'text'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file: ' + error.message
    });
  }
});

/**
 * List uploaded documents
 */
router.get('/documents', (req, res) => {
  try {
    const files = fs.readdirSync(knowledgeBaseDir).map(filename => {
      const filePath = path.join(knowledgeBaseDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        uploaded: stats.mtime
      };
    });

    res.json({
      success: true,
      documents: files,
      count: files.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get knowledge base content
 */
router.get('/knowledge-base', (req, res) => {
  try {
    const files = fs.readdirSync(knowledgeBaseDir);
    const knowledge = {};

    files.forEach(file => {
      const filePath = path.join(knowledgeBaseDir, file);
      knowledge[file] = fs.readFileSync(filePath, 'utf-8');
    });

    res.json({
      success: true,
      knowledge_base: knowledge,
      document_count: files.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete a document from knowledge base
 */
router.delete('/documents/:filename', (req, res) => {
  try {
    const filePath = path.join(knowledgeBaseDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Document deleted'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

