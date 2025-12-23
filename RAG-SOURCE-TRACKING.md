# RAG Source Tracking Enhancement

## Overview
Enhanced the RAG system to track and display **WHERE** in documents the AI is pulling information from.

## What Was Added

### 1. Position Tracking in Chunks
Each chunk now includes:
- **Start Character Position**: Where in the document the chunk begins
- **End Character Position**: Where the chunk ends
- **Chunk Index**: Which chunk number (e.g., 5 of 87)
- **Preview**: First 80 characters of the chunk for quick reference

### 2. Enhanced Backend Logging
The server console now shows:
```
📄 Chunk 1:
   • File: KRF-Ketamine-Guidelines.pdf.txt
   • Position: Chunk 23/87
   • Character Range: 45000-46200
   • Preview: "Side effects of ketamine include..."
   • Score: 50
   • Tokens: 853
   ✅ ADDED

📍 Sources Used:
   1. KRF-Ketamine-Guidelines.pdf.txt [Chunk 23/87, Chars 45000-46200]
   2. KRF-Ketamine-Guidelines.pdf.txt [Chunk 45/87, Chars 78000-79100]
   3. KRF-Ketamine-Guidelines.pdf.txt [Chunk 12/87, Chars 28000-29200]
```

### 3. Frontend Console Logging
Browser console now displays:
```
📍 === SOURCES REFERENCED ===

   Source 1:
   📄 File: KRF-Ketamine-Guidelines.pdf.txt
   📑 Chunk: 23 of 87
   📏 Characters: 45000-46200
   📝 Preview: "Side effects of ketamine include..."

   Source 2:
   📄 File: KRF-Ketamine-Guidelines.pdf.txt
   📑 Chunk: 45 of 87
   📏 Characters: 78000-79100
   📝 Preview: "Therapeutic benefits may include..."
```

### 4. API Response Enhancement
The `/api/therapy/chat-with-docs` endpoint now returns:
```json
{
  "success": true,
  "response": "...",
  "chunks_used": 3,
  "context_tokens": 2680,
  "sources": [
    {
      "filename": "KRF-Ketamine-Guidelines.pdf.txt",
      "chunkIndex": 23,
      "totalChunks": 87,
      "startChar": 45000,
      "endChar": 46200,
      "preview": "Side effects of ketamine include..."
    }
  ]
}
```

## How It Works

### Chunking Process
1. Document is split into ~600 character chunks at paragraph boundaries
2. Each chunk gets position metadata (start/end character positions)
3. Chunks are scored for relevance to user query
4. Top-scoring chunks are selected

### Source Tracking
1. Selected chunks retain their position information
2. Information flows through: Chunking → Scoring → Selection → API → Frontend
3. Both server logs and browser console show exact source locations

## Benefits

✅ **Transparency**: See exactly which parts of documents are being used
✅ **Verification**: Can manually check the source material
✅ **Debugging**: Easy to identify if wrong sections are being retrieved
✅ **Trust**: Users can verify AI responses against original documents
✅ **Improvement**: Can tune chunking/scoring based on which sections are selected

## Testing

1. Start the server
2. Open browser console (F12)
3. Ask a question with "Use uploaded documents" checked
4. Check both:
   - **Server terminal**: Detailed position info with previews
   - **Browser console**: Source references with file positions

## Example Output

### Question: "What are the side effects?"

**Server Log:**
```
📚 RAG EXTRACTION - Query: "what are the side effects..."
📁 Files in knowledge base: 2

📄 Processing: KRF-Ketamine-Guidelines.pdf.txt
   • File size: 102694 characters
   • Created 87 chunks (600 chars each)
   • Chunks with relevance score > 0: 20

🎯 Relevance Scoring Complete:
   • Total chunks with score > 0: 20
   • Top 5 scores: 50, 35, 30, 30, 30

   📄 Chunk 1:
      • File: KRF-Ketamine-Guidelines.pdf.txt
      • Position: Chunk 23/87
      • Character Range: 13800-14400
      • Preview: "Common side effects include nausea, dizziness..."
      • Score: 50
      ✅ ADDED

✅ RAG COMPLETE: 3 chunks, ~2680 tokens
📍 Sources Used:
   1. KRF-Ketamine-Guidelines.pdf.txt [Chunk 23/87, Chars 13800-14400]
   2. KRF-Ketamine-Guidelines.pdf.txt [Chunk 45/87, Chars 27000-27600]
   3. KRF-Ketamine-Guidelines.pdf.txt [Chunk 12/87, Chars 7200-7800]
```

**Browser Console:**
```
📚 === RAG INFORMATION ===
📁 Documents in KB: 2
📄 Chunks Used: 3
🔢 Context Tokens: 2680

📍 === SOURCES REFERENCED ===
   Source 1:
   📄 File: KRF-Ketamine-Guidelines.pdf.txt
   📑 Chunk: 23 of 87
   📏 Characters: 13800-14400
   📝 Preview: "Common side effects include nausea, dizziness..."
```

## Files Modified

1. **utils/chunking.js**: Added position tracking to chunks
2. **routes/therapy.js**: Pass source info to API response
3. **public/index.html**: Display sources in browser console

## Future Enhancements

- Display source citations in the chat UI (not just console)
- Add click-to-view-source functionality
- Highlight relevant sections in PDF viewer
- Add confidence scores for each source
- Show multiple relevant sections from different documents

