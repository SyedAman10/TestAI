# 🏗️ Project Structure

This document explains the organized structure of the Ketamine Therapy Companion AI project.

## 📁 Directory Structure

```
AI_BRAIN/
│
├── config/                    # Configuration files
│   └── prompts.js            # AI system prompts and configurations
│
├── middleware/                # Express middleware
│   └── upload.js             # File upload configuration (Multer)
│
├── routes/                    # API route handlers
│   ├── therapy.js            # Therapy-specific endpoints
│   └── general.js            # General API endpoints
│
├── utils/                     # Utility functions
│   ├── chunking.js           # Smart chunking and RAG functions
│   └── pdfParser.js          # PDF text extraction
│
├── public/                    # Frontend files
│   └── index.html            # Web interface
│
├── uploads/                   # Temporary file uploads (gitignored)
├── knowledge-base/            # Processed documents for RAG (gitignored)
│
├── server.js                  # Main server entry point (clean & minimal)
├── package.json              # Dependencies
└── .env                      # Environment variables (gitignored)
```

## 📄 File Descriptions

### `server.js`
**Main entry point** - Minimal and clean setup:
- Initializes Express app
- Configures middleware
- Mounts route modules
- Starts the server

### `config/prompts.js`
**AI Configuration**:
- `THERAPY_SYSTEM_PROMPT` - Therapeutic AI personality
- `DEFAULT_SYSTEM_PROMPT` - General AI prompt

### `middleware/upload.js`
**File Upload Middleware**:
- Multer configuration
- File size limits (10MB)
- Storage destination and naming

### `routes/therapy.js`
**Therapy API Endpoints**:
- `POST /api/therapy/chat` - Basic therapeutic conversation
- `POST /api/therapy/chat-with-docs` - RAG with smart chunking
- `POST /api/therapy/upload` - Upload documents (PDF, TXT, etc.)
- `GET /api/therapy/documents` - List uploaded documents
- `GET /api/therapy/knowledge-base` - Get all knowledge base content
- `DELETE /api/therapy/documents/:filename` - Delete a document

### `routes/general.js`
**General API Endpoints**:
- `GET /api/health` - Health check
- `POST /api/chat-with-context` - General RAG endpoint
- `POST /api/generate` - Text generation with conversation history

### `utils/chunking.js`
**Smart RAG Functions**:
- `chunkText()` - Splits text into semantic chunks
- `scoreChunkRelevance()` - Scores chunks based on keyword relevance
- `getRelevantContext()` - Returns top-K relevant chunks for a query

### `utils/pdfParser.js`
**PDF Processing**:
- `extractTextFromPDF()` - Extracts text from PDF buffers
- Uses `pdf-parse` library with CommonJS compatibility

## 🔄 Data Flow

### Document Upload Flow
```
User uploads PDF → upload.js middleware → pdfParser.js extracts text 
→ Save to knowledge-base/ → Return success
```

### RAG Chat Flow
```
User question → Extract keywords → chunking.js scores all chunks 
→ Select top 5 relevant chunks → Add to AI context → Generate response
```

## 🚀 Benefits of This Structure

1. **Separation of Concerns** - Each file has a single responsibility
2. **Maintainability** - Easy to find and update specific features
3. **Scalability** - Can add new routes/utils without cluttering
4. **Testability** - Individual modules can be tested independently
5. **Readability** - Clear structure makes onboarding easier

## 🔧 Adding New Features

### Add a new API endpoint:
1. Add route handler in `routes/therapy.js` or `routes/general.js`
2. No need to modify `server.js`

### Add new utility function:
1. Create file in `utils/` directory
2. Export functions
3. Import where needed

### Add new AI prompt:
1. Add to `config/prompts.js`
2. Import in route handlers

## 📝 Environment Variables

Required in `.env`:
```
HUGGINGFACE_API_KEY=your_api_key_here
PORT=3000
```

## 🧪 Testing

Start the server:
```bash
node server.js
```

The organized structure makes debugging easier - errors will show specific file locations!

