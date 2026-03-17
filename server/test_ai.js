require('dotenv').config();
const { generateCheckinFeedback } = require('./services/aiService');

const testAI = async () => {
  try {
    console.log('Testing AI with key:', process.env.OPENROUTER_API_KEY.substring(0, 10) + '...');
    const dummyStudent = { name: 'Test Student', techStack: 'React, Node', skillLevel: 'beginner' };
    const dummyCheckin = { learned: 'How to use Express', built: 'A simple route', problem: 'EADDRINUSE error' };
    
    const result = await generateCheckinFeedback(dummyStudent, dummyCheckin);
    console.log('AI Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('AI Test Failed:', err);
    process.exit(1);
  }
};

testAI();
