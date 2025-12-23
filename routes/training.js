import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { spawn } from 'child_process';
import { createRequire } from 'module';

// Import pdf-parse using require (CommonJS module)
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const trainingDataDir = path.join(__dirname, '..', 'fine-tuning', 'training-data');
const trainingExamplesFile = path.join(trainingDataDir, 'user-examples.json');

// Ensure training data directory exists
if (!fs.existsSync(trainingDataDir)) {
  fs.mkdirSync(trainingDataDir, { recursive: true });
}

// Initialize examples file if it doesn't exist
if (!fs.existsSync(trainingExamplesFile)) {
  fs.writeFileSync(trainingExamplesFile, JSON.stringify([], null, 2));
}

/**
 * Load training examples from file
 */
function loadExamples() {
  try {
    const data = fs.readFileSync(trainingExamplesFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading examples:', error);
    return [];
  }
}

/**
 * Save training examples to file
 */
function saveExamples(examples) {
  try {
    fs.writeFileSync(trainingExamplesFile, JSON.stringify(examples, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving examples:', error);
    return false;
  }
}

/**
 * Convert examples to JSONL format (OpenAI/Hugging Face)
 */
function toJSONLFormat(examples) {
  return examples.map(ex => JSON.stringify({
    messages: [
      {
        role: "system",
        content: "You are a compassionate and knowledgeable Ketamine Therapy Companion AI assistant."
      },
      { role: "user", content: ex.instruction },
      { role: "assistant", content: ex.response }
    ]
  })).join('\n');
}

/**
 * Convert examples to Alpaca format (LLaMA fine-tuning)
 */
function toAlpacaFormat(examples) {
  return JSON.stringify(examples.map(ex => ({
    instruction: ex.instruction,
    input: ex.context || "",
    output: ex.response
  })), null, 2);
}

/**
 * Convert examples to Chat format
 */
function toChatFormat(examples) {
  return JSON.stringify(examples.map(ex => ({
    conversation: [
      {
        role: "system",
        content: `You are a Ketamine Therapy Companion. ${ex.context ? 'Context: ' + ex.context : ''}`
      },
      { role: "user", content: ex.instruction },
      { role: "assistant", content: ex.response }
    ]
  })), null, 2);
}

/**
 * GET /api/training/examples - Get all training examples
 */
router.get('/examples', (req, res) => {
  try {
    const examples = loadExamples();
    res.json({
      success: true,
      examples: examples,
      count: examples.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training/add-example - Add a new training example
 */
router.post('/add-example', (req, res) => {
  try {
    const { instruction, context, response } = req.body;

    if (!instruction || !response) {
      return res.status(400).json({
        success: false,
        error: 'Instruction and response are required'
      });
    }

    const examples = loadExamples();
    examples.push({
      instruction,
      context: context || '',
      response,
      created_at: new Date().toISOString()
    });

    if (saveExamples(examples)) {
      console.log(`✅ Added training example (Total: ${examples.length})`);
      res.json({
        success: true,
        message: 'Training example added',
        total_examples: examples.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save example'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/training/examples/:index - Delete a training example
 */
router.delete('/examples/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const examples = loadExamples();

    if (index < 0 || index >= examples.length) {
      return res.status(404).json({
        success: false,
        error: 'Example not found'
      });
    }

    examples.splice(index, 1);

    if (saveExamples(examples)) {
      console.log(`🗑️  Deleted training example (Remaining: ${examples.length})`);
      res.json({
        success: true,
        message: 'Example deleted',
        remaining_examples: examples.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete example'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training/clear - Clear all training examples
 */
router.post('/clear', (req, res) => {
  try {
    if (saveExamples([])) {
      console.log('🗑️  Cleared all training examples');
      res.json({
        success: true,
        message: 'All examples cleared'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to clear examples'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/training/download/:format - Download training data in specified format
 */
router.get('/download/:format', (req, res) => {
  try {
    const format = req.params.format;
    const examples = loadExamples();

    if (examples.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No training examples to download'
      });
    }

    let content, filename, contentType;

    switch (format) {
      case 'jsonl':
        content = toJSONLFormat(examples);
        filename = 'training-data.jsonl';
        contentType = 'application/jsonl';
        break;

      case 'alpaca':
        content = toAlpacaFormat(examples);
        filename = 'training-data-alpaca.json';
        contentType = 'application/json';
        break;

      case 'chat':
        content = toChatFormat(examples);
        filename = 'training-data-chat.json';
        contentType = 'application/json';
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid format. Use: jsonl, alpaca, or chat'
        });
    }

    console.log(`💾 Downloading ${examples.length} examples in ${format} format`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/training/upload - Upload training data file
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    let newExamples = [];
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Parse based on file type
    if (ext === '.jsonl') {
      // JSONL format
      const lines = fileContent.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.messages) {
            const userMsg = data.messages.find(m => m.role === 'user');
            const assistantMsg = data.messages.find(m => m.role === 'assistant');
            if (userMsg && assistantMsg) {
              newExamples.push({
                instruction: userMsg.content,
                context: '',
                response: assistantMsg.content,
                created_at: new Date().toISOString()
              });
            }
          }
        } catch (e) { console.warn('Skipping invalid JSONL line'); }
      }
    } else if (ext === '.json') {
      // JSON format
      try {
        const data = JSON.parse(fileContent);
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.instruction && item.output) { // Alpaca
              newExamples.push({
                instruction: item.instruction,
                context: item.input || '',
                response: item.output,
                created_at: new Date().toISOString()
              });
            } else if (item.messages) { // Chat
              const userMsg = item.messages.find(m => m.role === 'user');
              const assistantMsg = item.messages.find(m => m.role === 'assistant');
              if (userMsg && assistantMsg) {
                newExamples.push({
                  instruction: userMsg.content,
                  context: '',
                  response: assistantMsg.content,
                  created_at: new Date().toISOString()
                });
              }
            }
          }
        }
      } catch (e) { console.warn('Invalid JSON file'); }
    } else if (ext === '.csv') {
      // Simple CSV parsing
      const lines = fileContent.split(/\r?\n/);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const instructionIdx = headers.findIndex(h => h.includes('instruction') || h.includes('question') || h.includes('input'));
      const responseIdx = headers.findIndex(h => h.includes('response') || h.includes('answer') || h.includes('output'));
      const contextIdx = headers.findIndex(h => h.includes('context'));

      if (instructionIdx !== -1 && responseIdx !== -1) {
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(','); // Basic split
          if (row.length >= 2) {
            newExamples.push({
              instruction: row[instructionIdx] || '',
              context: contextIdx !== -1 ? (row[contextIdx] || '') : '',
              response: row[responseIdx] || '',
              created_at: new Date().toISOString()
            });
          }
        }
      }
    } else if (ext === '.txt' || ext === '.md') {
      // Generic text file support
      newExamples.push({
        instruction: `Summarize the content of ${req.file.originalname}`,
        context: fileContent.substring(0, 1000),
        response: fileContent,
        created_at: new Date().toISOString()
      });
    } else if (ext === '.pdf') {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        newExamples.push({
          instruction: `Summarize the content of ${req.file.originalname}`,
          context: data.text.substring(0, 1000),
          response: data.text,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('PDF parse error:', e);
        return res.status(400).json({ success: false, error: 'Failed to parse PDF' });
      }
    }

    if (newExamples.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid training examples found in file'
      });
    }

    // Merge with existing examples
    const existingExamples = loadExamples();
    const allExamples = [...existingExamples, ...newExamples];

    if (saveExamples(allExamples)) {
      console.log(`📤 Uploaded ${newExamples.length} training examples (Total: ${allExamples.length})`);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: 'Training data uploaded successfully',
        examples_added: newExamples.length,
        total_examples: allExamples.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save examples'
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process file: ' + error.message
    });
  }
});

/**
 * POST /api/training/train-local - Start local training
 */
router.post('/train-local', (req, res) => {
  console.log('🚀 Starting local training process...');

  const scriptPath = path.join(__dirname, '..', 'scripts', 'train.py');
  const pythonProcess = spawn('python', [scriptPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Training]: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Training Error]: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Training process exited with code ${code}`);
  });

  res.json({
    success: true,
    message: 'Local training started! Check server console for progress.'
  });
});

/**
 * GET /api/training/stats - Get training data statistics
 */
router.get('/stats', (req, res) => {
  try {
    const examples = loadExamples();

    const stats = {
      total_examples: examples.length,
      avg_instruction_length: examples.length > 0
        ? Math.round(examples.reduce((sum, ex) => sum + ex.instruction.length, 0) / examples.length)
        : 0,
      avg_response_length: examples.length > 0
        ? Math.round(examples.reduce((sum, ex) => sum + ex.response.length, 0) / examples.length)
        : 0,
      with_context: examples.filter(ex => ex.context && ex.context.length > 0).length,
      readiness: {
        min_examples: examples.length >= 100,
        recommended_examples: examples.length >= 500,
        quality_check: examples.length > 0 &&
          examples.every(ex => ex.instruction && ex.response &&
            ex.response.length > 50 &&
            ex.response.length < 3000)
      }
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;





