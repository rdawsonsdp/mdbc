import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('Assistants location:');
console.log('openai.assistants?', typeof openai.assistants);
console.log('openai.beta.assistants?', typeof openai.beta.assistants);
console.log('\nBeta assistants properties:');
if (openai.beta.assistants) {
  console.log(Object.keys(openai.beta.assistants));
}

