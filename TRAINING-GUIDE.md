# Guide: Using Your Files/Data with the AI Model

Since the Hugging Face Inference API doesn't support direct training, here are **practical approaches** to customize the model with your data:

---

## 🎯 Option 1: RAG (Retrieval Augmented Generation) - ✅ RECOMMENDED

**What it is:** Provide your documents/files as context in each request. The model reads them and answers based on that content.

**Advantages:**
- ✅ Works immediately - no training needed
- ✅ Can update knowledge in real-time
- ✅ Cost-effective
- ✅ Easy to implement

**Best for:** 
- Company documentation
- Product manuals
- Knowledge bases
- FAQs
- Reports and analysis

### How to Use:

**1. Basic Example:**
```bash
curl -X POST http://localhost:3000/api/chat-with-context \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key features?",
    "context": "Product Features: AI-powered, Cloud-based, Real-time analytics..."
  }'
```

**2. With Files (Node.js):**
```javascript
import fs from 'fs';

const fileContent = fs.readFileSync('./your-document.txt', 'utf-8');

const response = await fetch('http://localhost:3000/api/chat-with-context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Summarize this document',
    context: fileContent
  })
});
```

**3. With Multiple Files:**
```javascript
const doc1 = fs.readFileSync('./file1.txt', 'utf-8');
const doc2 = fs.readFileSync('./file2.txt', 'utf-8');
const combinedContext = `${doc1}\n\n${doc2}`;

// Use combinedContext in your request
```

### Supported File Types:
- ✅ Text files (.txt)
- ✅ Markdown (.md)
- ✅ JSON (.json)
- ✅ CSV (converted to text)
- ✅ Code files (.js, .py, etc.)
- ✅ Any text-based format

**Run the example:**
```bash
node example-with-files.js
```

---

## 🎨 Option 2: System Prompts - Customize Behavior

**What it is:** Tell the model how to behave and respond.

**Example:**
```javascript
{
  "message": "Help me with a customer issue",
  "context": "Company policies and procedures...",
  "system_prompt": "You are a professional customer service agent. Be polite, helpful, and follow company guidelines strictly."
}
```

**Use cases:**
- Customer service bot
- Technical support
- Educational tutor
- Code reviewer
- Writing assistant

---

## 💪 Option 3: Actual Fine-Tuning (Advanced)

If you need **real training** (permanent model customization), you'll need to:

### Steps:
1. **Prepare training data** (JSON format with examples)
2. **Use Hugging Face's training infrastructure**:
   - Use AutoTrain: https://huggingface.co/autotrain
   - Or use compute resources (Google Colab, AWS, etc.)

### Requirements:
- Training dataset (minimum 100-1000 examples)
- GPU/TPU resources
- Time (hours to days depending on model size)
- Technical knowledge (Python, PyTorch/TensorFlow)

### When to use fine-tuning:
- ✅ You have thousands of training examples
- ✅ Need permanent behavior changes
- ✅ Domain-specific language (medical, legal, etc.)
- ✅ Budget for compute resources

### Quick Start with AutoTrain:
```bash
pip install autotrain-advanced

autotrain llm \
  --train \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --data-path ./your-dataset \
  --project-name my-custom-model
```

---

## 📊 Comparison

| Approach | Setup Time | Cost | Updates | Best For |
|----------|-----------|------|---------|----------|
| **RAG** | Minutes | Free | Real-time | Documents, Q&A, Knowledge base |
| **System Prompts** | Seconds | Free | Instant | Behavior customization |
| **Fine-tuning** | Hours-Days | $$$ | Manual | Domain expertise, specialized tasks |

---

## 🚀 Recommended Workflow

**For most use cases, start with RAG:**

1. **Organize your files**
   ```
   /data
     - company-policies.txt
     - product-info.txt
     - faq.txt
   ```

2. **Load and combine them**
   ```javascript
   const context = loadAllFiles('./data');
   ```

3. **Make requests with context**
   ```javascript
   fetch('/api/chat-with-context', {
     body: JSON.stringify({ message, context })
   })
   ```

4. **Iterate and improve**
   - Adjust system prompts
   - Organize context better
   - Add more relevant data

---

## 💡 Tips for Better Results

### 1. **Keep context relevant**
   - Don't send entire databases
   - Extract relevant sections only
   - Use search/indexing if you have many files

### 2. **Structure your context**
   ```
   Context Format:

   SECTION 1: Company Info
   [relevant text]

   SECTION 2: Policies
   [relevant text]
   ```

### 3. **Optimize prompt**
   - Be specific in questions
   - Reference the context: "Based on the document..."

### 4. **Handle large files**
   - Split into chunks
   - Use only relevant sections
   - Consider vector databases (Pinecone, Weaviate) for large datasets

---

## 🎯 Next Steps

1. **Try the RAG endpoint:** 
   ```bash
   node example-with-files.js
   ```

2. **Test with your actual files:**
   - Replace paths in `example-with-files.js`
   - Adjust system prompts for your use case

3. **Build your application:**
   - Create a frontend
   - Add file upload capability
   - Implement document search

4. **Consider fine-tuning only if:**
   - RAG doesn't meet your needs
   - You have significant training data
   - You need permanent customization

---

## 📚 Resources

- **Hugging Face Docs:** https://huggingface.co/docs
- **AutoTrain:** https://huggingface.co/autotrain
- **RAG Tutorial:** https://huggingface.co/learn/cookbook/rag
- **Fine-tuning Guide:** https://huggingface.co/docs/transformers/training

---

**Questions?** The RAG approach (Option 1) works for 90% of use cases and is the fastest way to get started!

