// Direct API test
const testData = {
  query: "What are my business strengths?",
  userData: {
    name: "Test User",
    birthCard: "Queen of Hearts",
    age: 35,
    uid: "test"
  },
  sessionId: "test-session-" + Date.now()
};

console.log('🧪 Testing API endpoint...');
console.log('Request:', testData);

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(res => {
    console.log('📊 Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('✅ Response received:');
    console.log('- Response length:', data.response?.length || 0, 'chars');
    console.log('- Citations:', data.citations);
    console.log('- Thread ID:', data.threadId);
    console.log('\n📝 Full response:');
    console.log(data.response);
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });

