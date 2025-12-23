import express from 'express';
import { DEFAULT_SYSTEM_PROMPT } from '../config/prompts.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Ketamine Therapy Companion API',
    endpoints: {
      chat: 'POST /api/therapy/chat',
      'upload-document': 'POST /api/therapy/upload',
      'chat-with-context': 'POST /api/therapy/chat-with-docs',
      'list-documents': 'GET /api/therapy/documents',
      'knowledge-base': 'GET /api/therapy/knowledge-base'
    }
  });
});

/**
 * RAG endpoint - Use your documents/files as context
 */
router.post('/chat-with-context', async (req, res) => {
  try {
    const { 
      message, 
      context,
      max_tokens = 1000, 
      temperature = 0.7,
      provider = 'auto',
      system_prompt = DEFAULT_SYSTEM_PROMPT
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: system_prompt
      }
    ];

    // Add context if provided
    if (context) {
      messages.push({
        role: 'system',
        content: `Context/Knowledge Base:\n${context}`
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
      context_used: !!context
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
 * Alternative generation endpoint with conversation history support
 */
router.post('/generate', async (req, res) => {
  try {
    const { 
      prompt, 
      conversation_history = [], 
      max_tokens = 500, 
      temperature = 0.7,
      provider = 'auto'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const messages = [];
    
    // Add conversation history
    if (conversation_history.length > 0) {
      conversation_history.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }
    
    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
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
      provider: provider
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing your request'
    });
  }
});

export default router;

