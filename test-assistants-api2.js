import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('Beta assistants methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(openai.beta.assistants)));

