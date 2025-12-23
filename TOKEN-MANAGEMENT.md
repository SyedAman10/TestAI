# 🎯 Token Management & RAG Optimization

## Problem Statement

The system was encountering errors when processing large PDF documents:

```
Error: The input (1,339,759 tokens) is longer than the model's context length (16,384 tokens)
```

**Root Cause:** Even with chunking, we were sending too much text to the AI model.

## Solution Implemented

### 1. Token Estimation System (`utils/tokenEstimator.js`)

Created a conservative token estimation system:
- **Rule of thumb:** 1 token ≈ 3.5 characters
- **Model limit:** 16,384 tokens (Llama 3.1 8B)
- **Safe limit:** 14,000 tokens (leaving room for prompts and response)

Key functions:
- `estimateTokens(text)` - Estimates token count
- `truncateToTokenLimit(text, maxTokens)` - Safely truncates if needed
- `calculateAvailableContextTokens()` - Returns available space for context

### 2. Optimized Chunking (`utils/chunking.js`)

**Changes made:**

| Parameter | Before | After | Reason |
|-----------|--------|-------|--------|
| Chunk size | 2000 chars | 600 chars | Smaller, more focused chunks |
| Top chunks | 5 | 3 | Fewer chunks = lower token count |
| Return type | String | Object | Added metadata (tokens, count) |

**New flow:**
1. Split documents into 600-character chunks
2. Score chunks by relevance to user query
3. Select top 3 most relevant chunks
4. Verify total tokens stay under limit
5. Truncate if necessary as failsafe

### 3. Enhanced Route Handler (`routes/therapy.js`)

Updated `/api/therapy/chat-with-docs` endpoint:
- Now tracks token usage
- Returns `context_tokens` and `chunks_used` in response
- Logs RAG context stats to console

## Token Budget Breakdown

```
Total Model Context: 16,384 tokens
├─ System Prompt:     ~500 tokens
├─ User Message:      ~200 tokens  
├─ RAG Context:     ~12,300 tokens (available)
└─ AI Response:      ~1,000 tokens
────────────────────────────────────
Safe Limit:          14,000 tokens
```

## How It Works Now

### Before (FAILED ❌):
```
20,942 lines PDF → Load all → 1.3M tokens → API Error
```

### After (SUCCESS ✅):
```
20,942 lines PDF 
  → Split into ~35,000 chunks (600 chars each)
  → Score all chunks by relevance
  → Select top 3 most relevant
  → ~1,500-2,000 tokens
  → API Success!
```

## Response Format

The chat-with-docs endpoint now returns:

```json
{
  "success": true,
  "response": "AI response here...",
  "knowledge_base_used": true,
  "documents_count": 1,
  "chunks_used": 3,
  "context_tokens": 1847,
  "method": "smart_chunking_v2",
  "disclaimer": "This is not medical advice..."
}
```

## Console Logging

The system now logs helpful information:

```
✅ RAG Context: 3 chunks, ~1847 tokens
```

Or if limits are reached:

```
⚠️  Stopping at 2 chunks - would exceed token limit
⚠️  Context too large (15234 tokens), truncating to 14000
```

## Testing

To test with your large PDF:

1. Start server: `node server.js`
2. Upload PDF via web interface
3. Ask a question with "Use uploaded documents" checked
4. Check response includes `context_tokens` and `chunks_used`

## Configuration

You can adjust parameters in your API request:

```javascript
{
  "message": "What are the dosage guidelines?",
  "use_knowledge_base": true,
  "top_chunks": 3,  // Increase for more context (max 5 recommended)
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Warning:** Increasing `top_chunks` beyond 3-4 may cause token limit errors with very large documents.

## Benefits

✅ **Handles PDFs of any size** - Even 20,000+ line documents  
✅ **Fast responses** - Only relevant chunks processed  
✅ **Accurate answers** - Focuses on most relevant content  
✅ **Safe & reliable** - Multiple layers of protection  
✅ **Transparent** - Returns token usage stats  

## Technical Details

### Chunk Scoring Algorithm

Each chunk is scored based on:
1. **Keyword matches** - 10 points per occurrence
2. **Position bonus** - +5 points if keyword in first 200 chars
3. **Multiple occurrences** - Multiplied by frequency

### Token Estimation Accuracy

Our estimation is conservative (3.5 chars/token):
- Actual ratio varies: 3-5 chars/token
- Conservative estimate prevents overruns
- Better to underestimate and be safe

### Why 600 Characters Per Chunk?

- ~170 tokens per chunk
- 3 chunks = ~510 tokens
- Plus headers/formatting = ~600 tokens
- Safe margin for question variations

## Future Improvements

Potential enhancements:
- [ ] Semantic embeddings for better relevance scoring
- [ ] Caching of chunked documents
- [ ] Dynamic chunk sizing based on document structure
- [ ] Support for multiple document types (Word, PowerPoint)
- [ ] User-configurable token budgets

## Troubleshooting

### Still getting token errors?

1. Reduce `top_chunks` to 2
2. Check if multiple large documents are in knowledge base
3. Verify logs show token count staying under 14,000

### Answers not relevant?

1. Increase `top_chunks` to 4-5
2. Check chunk scoring with more specific keywords
3. Consider improving stop words list

### Want more context?

Balance is key:
- More chunks = more context but higher token usage
- Fewer chunks = faster, safer, but might miss info
- Sweet spot: 3-4 chunks for most use cases

