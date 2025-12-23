// Script to prepare training data for fine-tuning
// This creates the dataset format needed for fine-tuning LLM models

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Training data format for fine-tuning:
 * Each example should have:
 * - instruction: The user's input/question
 * - context: Optional context (e.g., therapy protocols)
 * - response: The expected AI response
 */

// Example training data for ketamine therapy companion
const trainingExamples = [
  {
    instruction: "I'm feeling anxious about my first ketamine therapy session. What should I expect?",
    context: "Pre-session preparation",
    response: "It's completely natural to feel anxious before your first session. Here's what typically happens: You'll be in a comfortable, safe environment with your therapist present. The medication is usually administered via IV or nasal spray. You may experience altered perceptions, a sense of floating, or vivid imagery. These effects are temporary and part of the therapeutic process. Your therapist will guide you and ensure your safety throughout. Remember to: 1) Set a positive intention, 2) Trust the process, 3) Stay relaxed and open. Would you like to discuss any specific concerns?"
  },
  {
    instruction: "What is ketamine therapy used for?",
    context: "General information",
    response: "Ketamine-assisted therapy is an evidence-based treatment primarily used for: 1) Treatment-resistant depression, 2) PTSD (Post-Traumatic Stress Disorder), 3) Severe anxiety disorders, 4) Certain chronic pain conditions. It works by modulating glutamate receptors in the brain, which can help create new neural pathways and reduce depressive symptoms. The therapy combines the medication with psychotherapy for optimal results. It's important to note that this treatment should only be administered by qualified healthcare professionals in a controlled medical setting."
  },
  {
    instruction: "I'm having trouble integrating my ketamine experience. Can you help?",
    context: "Post-session integration",
    response: "Integration is a crucial part of the healing process. Here are some helpful approaches: 1) **Journaling**: Write about your experience, emotions, and any insights you gained. 2) **Creative Expression**: Draw, paint, or use music to process your experience. 3) **Mindfulness**: Practice meditation to stay present with your feelings. 4) **Therapy**: Discuss your experience with your therapist to understand its meaning. 5) **Self-Care**: Ensure adequate rest, nutrition, and gentle movement. Remember, integration is a gradual process. It's okay if you don't understand everything immediately. What specific aspects are you finding challenging?"
  },
  {
    instruction: "Are there any side effects I should be aware of?",
    context: "Safety and side effects",
    response: "While ketamine therapy is generally safe when administered properly, there are some potential side effects to be aware of: **During treatment**: Altered perception, dizziness, nausea, increased heart rate or blood pressure, dissociation. **After treatment**: Fatigue, headache, mild confusion (usually temporary). **Rare but serious**: Allergic reactions, respiratory issues (if not properly monitored). This is why it's crucial to: 1) Only receive treatment from qualified professionals, 2) Be honest about your medical history, 3) Follow all pre and post-treatment guidelines, 4) Have someone accompany you home. If you experience concerning symptoms, contact your healthcare provider immediately. Do you have specific concerns about side effects?"
  },
  {
    instruction: "How many sessions will I need?",
    context: "Treatment planning",
    response: "The number of sessions varies by individual and condition being treated. Typical protocols include: **Initial Phase**: Usually 6-8 sessions over 2-4 weeks for depression. **Maintenance**: Some people benefit from monthly or as-needed sessions. **Factors affecting duration**: Severity of symptoms, response to treatment, individual brain chemistry, concurrent therapy and lifestyle factors. Your healthcare provider will create a personalized treatment plan based on: Your specific diagnosis, how you respond to initial treatments, your goals and progress. It's important to have realistic expectations and give the treatment adequate time to work. How are you feeling about your current treatment plan?"
  }
];

// Convert to different fine-tuning formats

// Format 1: JSON Lines format (for Hugging Face, OpenAI)
function createJSONLFormat(examples) {
  return examples.map(ex => JSON.stringify({
    messages: [
      { role: "system", content: "You are a compassionate and knowledgeable Ketamine Therapy Companion AI assistant." },
      { role: "user", content: ex.instruction },
      { role: "assistant", content: ex.response }
    ]
  })).join('\n');
}

// Format 2: Alpaca format (for LLaMA fine-tuning)
function createAlpacaFormat(examples) {
  return JSON.stringify(examples.map(ex => ({
    instruction: ex.instruction,
    input: ex.context || "",
    output: ex.response
  })), null, 2);
}

// Format 3: Chat format with context
function createChatFormat(examples) {
  return JSON.stringify(examples.map(ex => ({
    conversation: [
      { role: "system", content: `You are a Ketamine Therapy Companion. Context: ${ex.context}` },
      { role: "user", content: ex.instruction },
      { role: "assistant", content: ex.response }
    ]
  })), null, 2);
}

// Save training data in multiple formats
const outputDir = path.join(__dirname, 'training-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save JSONL format
fs.writeFileSync(
  path.join(outputDir, 'training-data.jsonl'),
  createJSONLFormat(trainingExamples)
);

// Save Alpaca format
fs.writeFileSync(
  path.join(outputDir, 'training-data-alpaca.json'),
  createAlpacaFormat(trainingExamples)
);

// Save Chat format
fs.writeFileSync(
  path.join(outputDir, 'training-data-chat.json'),
  createChatFormat(trainingExamples)
);

// Create README for the training data
const readmeContent = `# Training Data for Ketamine Therapy Companion

## Dataset Information

- **Format**: Multiple formats provided (JSONL, Alpaca, Chat)
- **Examples**: ${trainingExamples.length} training examples
- **Use Case**: Fine-tuning LLM for ketamine-assisted therapy support

## Files

1. \`training-data.jsonl\` - OpenAI/Hugging Face format
2. \`training-data-alpaca.json\` - Alpaca format for LLaMA
3. \`training-data-chat.json\` - Chat format with context

## How to Add More Examples

Edit \`prepare-training-data.js\` and add examples to the \`trainingExamples\` array:

\`\`\`javascript
{
  instruction: "User's question or input",
  context: "Optional context",
  response: "Expected AI response"
}
\`\`\`

Then run: \`node prepare-training-data.js\`

## Next Steps for Fine-Tuning

See \`../FINE-TUNING-GUIDE.md\` for complete instructions.
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);

console.log(`✅ Training data prepared successfully!`);
console.log(`📁 Location: ${outputDir}`);
console.log(`📊 Examples: ${trainingExamples.length}`);
console.log(`\n📝 Files created:`);
console.log(`   - training-data.jsonl`);
console.log(`   - training-data-alpaca.json`);
console.log(`   - training-data-chat.json`);
console.log(`   - README.md`);
console.log(`\n💡 To add more examples, edit this script and run it again.`);

