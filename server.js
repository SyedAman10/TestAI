import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import therapyRoutes from './routes/therapy.js';
import generalRoutes from './routes/general.js';
import trainingRoutes from './routes/training.js';

// ES module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Hugging Face Inference Client
const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
app.set('inferenceClient', client);

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const knowledgeBaseDir = path.join(__dirname, 'knowledge-base');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(knowledgeBaseDir)) fs.mkdirSync(knowledgeBaseDir);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mount routes
app.use('/api/therapy', therapyRoutes);
app.use('/api', generalRoutes);
app.use('/api/training', trainingRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧠  KETAMINE THERAPY COMPANION API`);
  console.log(`${'='.repeat(60)}`);
  console.log(`🚀  Server: http://localhost:${PORT}`);
  console.log(`🌐  Frontend: http://localhost:${PORT}/index.html`);
  console.log(`📝  Model: Meta Llama 3.1 8B Instruct`);
  console.log(`🔑  API Key: ${process.env.HUGGINGFACE_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`📂  Knowledge Base: ${knowledgeBaseDir}`);
  console.log(`📤  Uploads: ${uploadsDir}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`✨  Features:`);
  console.log(`   • Smart Chunking RAG for large documents`);
  console.log(`   • PDF Support with text extraction`);
  console.log(`   • Therapeutic conversation AI`);
  console.log(`   • Knowledge base management\n`);
});
