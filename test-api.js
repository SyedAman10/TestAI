// Simple test script to verify the API is working
// Make sure the server is running before executing this script
// Run: node test-api.js

const testChat = async () => {
  try {
    console.log('🧪 Testing /api/chat endpoint...\n');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello! Can you explain what you are in one sentence?',
        max_tokens: 100,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success!');
      console.log('📝 Response:', data.response);
      console.log('🤖 Model:', data.model);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
};

const testGenerate = async () => {
  try {
    console.log('\n\n🧪 Testing /api/generate endpoint with conversation history...\n');
    
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'What are the main attractions there?',
        conversation_history: [
          {
            role: 'user',
            content: 'Tell me about Paris'
          },
          {
            role: 'assistant',
            content: 'Paris is the capital and largest city of France.'
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success!');
      console.log('📝 Response:', data.response);
      console.log('🤖 Model:', data.model);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Run tests
console.log('🚀 Starting API tests...\n');
console.log('=' .repeat(50));

testChat().then(() => {
  testGenerate().then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('\n✨ All tests completed!');
  });
});

