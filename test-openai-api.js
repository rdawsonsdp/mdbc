import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('OpenAI client properties:');
console.log(Object.keys(openai));
console.log('\nBeta properties:');
console.log(openai.beta ? Object.keys(openai.beta) : 'beta not found');

