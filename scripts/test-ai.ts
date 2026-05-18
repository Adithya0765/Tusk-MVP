import { callAgentA, callAgentB } from '../lib/ai-provider';

async function test() {
  console.log('Testing Agent A (Gemini)...');
  const a = await callAgentA(
    'You are a debater arguing FOR the topic.',
    'Is remote work better than office work? Give one strong argument.'
  );
  console.log('Agent A response:', a);

  console.log('\nTesting Agent B (Grok)...');
  const b = await callAgentB(
    'You are a debater arguing AGAINST the topic.',
    'Is remote work better than office work? Give one strong argument.'
  );
  console.log('Agent B response:', b);
}

test().catch(console.error);
