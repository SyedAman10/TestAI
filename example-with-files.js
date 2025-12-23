// Example: How to use your files/documents with the AI model (RAG approach)
// This demonstrates how to "train" the model on your data without actual fine-tuning

import fs from 'fs';

// Example 1: Load a text file and ask questions about it
async function askAboutDocument() {
  try {
    // Read your file content (replace with your actual file path)
    const fileContent = fs.readFileSync('./your-document.txt', 'utf-8');
    
    const response = await fetch('http://localhost:3000/api/chat-with-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'What are the main points in this document?',
        context: fileContent, // Your file content as context
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ AI Response:');
      console.log(data.response);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
}

// Example 2: Use multiple files as knowledge base
async function useMultipleFiles() {
  try {
    // Load multiple files
    const file1 = fs.readFileSync('./doc1.txt', 'utf-8');
    const file2 = fs.readFileSync('./doc2.txt', 'utf-8');
    
    // Combine them
    const combinedContext = `
Document 1:
${file1}

Document 2:
${file2}
    `;
    
    const response = await fetch('http://localhost:3000/api/chat-with-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Compare the information from both documents',
        context: combinedContext,
        max_tokens: 800,
        temperature: 0.5
      })
    });

    const data = await response.json();
    console.log(data.response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: Custom system prompt for specific use case
async function customBehavior() {
  try {
    const knowledgeBase = fs.readFileSync('./company-info.txt', 'utf-8');
    
    const response = await fetch('http://localhost:3000/api/chat-with-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'What are our company policies on remote work?',
        context: knowledgeBase,
        system_prompt: 'You are a helpful HR assistant. Answer questions based only on the company documentation provided. Be professional and concise.',
        max_tokens: 500
      })
    });

    const data = await response.json();
    console.log(data.response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 4: JSON data as context
async function useJSONData() {
  try {
    const jsonData = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    
    // Convert JSON to readable text for the AI
    const contextText = JSON.stringify(jsonData, null, 2);
    
    const response = await fetch('http://localhost:3000/api/chat-with-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Analyze this data and provide insights',
        context: `Here is the data:\n${contextText}`,
        max_tokens: 600
      })
    });

    const data = await response.json();
    console.log(data.response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Simple test with inline context (no file needed)
async function quickTest() {
  try {
    const response = await fetch('http://localhost:3000/api/chat-with-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'What is the company founded date?',
        context: `
Company Information:
Name: TechCorp
Founded: 2020
Location: San Francisco
Employees: 150
Products: AI Software, Cloud Services
        `,
        max_tokens: 200
      })
    });

    const data = await response.json();
    
    console.log('🧪 Quick Test Result:');
    console.log('Question: What is the company founded date?');
    console.log('Answer:', data.response);
    console.log('\n✅ Context was used:', data.context_used);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the quick test
console.log('🚀 Testing RAG endpoint with custom context...\n');
quickTest();

// Uncomment to try other examples:
// askAboutDocument();
// useMultipleFiles();
// customBehavior();
// useJSONData();

