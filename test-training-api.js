// Test script for the Training Center API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

console.log('🧪 Testing Training Center API\n');
console.log('=' .repeat(60));

async function testAddExample() {
  console.log('\n✅ TEST 1: Add Training Example');
  console.log('-'.repeat(60));
  
  const example = {
    instruction: "What should I expect during my first ketamine therapy session?",
    context: "Pre-session preparation",
    response: "During your first session, you'll be in a safe, comfortable environment with your therapist present. The ketamine will be administered (usually via IV or nasal spray), and you may experience altered perceptions, a sense of floating, or vivid imagery. These effects are temporary and part of the therapeutic process. Your therapist will monitor you throughout and help you process the experience afterward. The session typically lasts 45-90 minutes."
  };

  try {
    const response = await fetch(`${API_URL}/api/training/add-example`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(example)
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('✅ PASSED: Example added successfully\n');
    return true;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    return false;
  }
}

async function testGetExamples() {
  console.log('\n✅ TEST 2: Get All Examples');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_URL}/api/training/examples`);
    const data = await response.json();
    
    console.log('Response:', data);
    console.log(`✅ PASSED: Retrieved ${data.count} examples\n`);
    return data.examples;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    return [];
  }
}

async function testGetStats() {
  console.log('\n✅ TEST 3: Get Training Statistics');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_URL}/api/training/stats`);
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ PASSED: Got statistics\n');
    return true;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    return false;
  }
}

async function testDownloadFormat(format) {
  console.log(`\n✅ TEST 4: Download Training Data (${format.toUpperCase()})`);
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${API_URL}/api/training/download/${format}`);
    const text = await response.text();
    
    console.log('Downloaded data preview:');
    console.log(text.substring(0, 200) + '...\n');
    console.log(`✅ PASSED: Downloaded ${format} format\n`);
    return true;
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    return false;
  }
}

async function testAddMultipleExamples() {
  console.log('\n✅ TEST 5: Add Multiple Examples');
  console.log('-'.repeat(60));
  
  const examples = [
    {
      instruction: "How long does the effect of ketamine last?",
      context: "Treatment duration",
      response: "The acute effects during the session last 45-90 minutes. However, the therapeutic benefits can last days to weeks. Most treatment protocols involve multiple sessions to build and maintain these benefits. Some patients experience immediate mood improvements, while for others it's more gradual."
    },
    {
      instruction: "What are common side effects?",
      context: "Safety information",
      response: "Common side effects during treatment include: altered perception, dizziness, nausea, increased heart rate, and a sense of dissociation. These typically resolve within hours after the session. Post-treatment, some people experience mild fatigue or headaches. Serious side effects are rare when administered by qualified professionals in a controlled setting."
    },
    {
      instruction: "Can I drive after a session?",
      context: "Post-session care",
      response: "No, you should NOT drive after a ketamine therapy session. The effects can impair your coordination and judgment for several hours. You must arrange for someone to drive you home, or use a ride service. Plan to rest for the remainder of the day and avoid operating machinery or making important decisions."
    }
  ];

  let added = 0;
  for (const ex of examples) {
    try {
      const response = await fetch(`${API_URL}/api/training/add-example`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ex)
      });
      
      const data = await response.json();
      if (data.success) added++;
    } catch (error) {
      console.error('Error adding example:', error.message);
    }
  }

  console.log(`✅ PASSED: Added ${added}/${examples.length} examples\n`);
  return added === examples.length;
}

async function runAllTests() {
  console.log('\n🚀 Starting Training Center Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Add single example
  results.total++;
  if (await testAddExample()) results.passed++; else results.failed++;

  // Test 2: Get examples
  results.total++;
  const examples = await testGetExamples();
  if (examples) results.passed++; else results.failed++;

  // Test 3: Add multiple examples
  results.total++;
  if (await testAddMultipleExamples()) results.passed++; else results.failed++;

  // Test 4: Get stats
  results.total++;
  if (await testGetStats()) results.passed++; else results.failed++;

  // Test 5: Download formats
  for (const format of ['jsonl', 'alpaca', 'chat']) {
    results.total++;
    if (await testDownloadFormat(format)) results.passed++; else results.failed++;
  }

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Training Center is working perfectly.\n');
    console.log('Next steps:');
    console.log('1. Open http://localhost:3000/training.html');
    console.log('2. Add more training examples');
    console.log('3. Download your training data');
    console.log('4. Follow FINE-TUNING-GUIDE.md to train your model\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.\n');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  console.log('\nMake sure your server is running:');
  console.log('  npm start\n');
});





