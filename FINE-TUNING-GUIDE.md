# Complete Fine-Tuning Guide for Ketamine Therapy Companion

This guide walks you through **actual fine-tuning** of the LLM model with your therapeutic data.

---

## 🎯 Overview

**What You Have Now:**
- ✅ RAG system (knowledge base with uploaded documents)
- ✅ Therapeutic system prompts
- ✅ File upload capability

**What Fine-Tuning Adds:**
- ✅ Model permanently learns your therapy style
- ✅ Better understanding of domain-specific language
- ✅ More consistent therapeutic responses
- ✅ No need to send context with every request

---

## 📋 Prerequisites

### 1. Training Data
You need **100-1000+ examples** of quality conversations. I've provided 5 example templates in `fine-tuning/prepare-training-data.js`.

**To create more training data:**
```bash
# Edit the file and add your examples
node fine-tuning/prepare-training-data.js
```

### 2. Compute Resources
Fine-tuning requires GPU access. Options:

**Option A: Google Colab (Free/Paid)**
- Free: Limited GPU time
- Pro: $10/month for more GPU
- Pro+: $50/month for best GPUs

**Option B: Hugging Face AutoTrain**
- Easy to use
- Pay per training job
- ~$5-50 depending on model size

**Option C: Cloud Providers**
- AWS, Azure, GCP
- More control but more complex
- Cost varies

### 3. Python Environment
```bash
pip install transformers datasets accelerate bitsandbytes peft
```

---

## 🚀 Method 1: Hugging Face AutoTrain (Easiest)

### Step 1: Prepare Your Data
```bash
node fine-tuning/prepare-training-data.js
```

### Step 2: Install AutoTrain
```bash
pip install autotrain-advanced
```

### Step 3: Login to Hugging Face
```bash
huggingface-cli login
# Enter your Hugging Face token
```

### Step 4: Start Fine-Tuning
```bash
autotrain llm \
  --train \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --data-path ./fine-tuning/training-data \
  --project-name ketamine-therapy-companion \
  --text-column text \
  --lr 2e-4 \
  --batch-size 4 \
  --epochs 3 \
  --trainer sft
```

This will:
- Download the base model
- Train on your data
- Upload to your Hugging Face account
- Take 1-6 hours depending on data size

### Step 5: Use Your Fine-Tuned Model

Update `server.js` to use your model:

```javascript
// Change this line:
model: 'meta-llama/Llama-3.1-8B-Instruct',

// To your model:
model: 'YOUR_USERNAME/ketamine-therapy-companion',
```

---

## 🔬 Method 2: Google Colab (More Control)

### Step 1: Open Colab
Go to [Google Colab](https://colab.research.google.com/)

### Step 2: Use This Notebook Code

```python
# Install requirements
!pip install -q transformers datasets accelerate bitsandbytes peft trl

# Import libraries
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from datasets import load_dataset
from trl import SFTTrainer
from peft import LoraConfig
import torch

# Load model and tokenizer
model_name = "meta-llama/Llama-3.1-8B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    torch_dtype=torch.float16
)

# Load your training data (upload training-data.jsonl to Colab)
dataset = load_dataset("json", data_files="training-data.jsonl", split="train")

# Configure LoRA (efficient fine-tuning)
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
    task_type="CAUSAL_LM"
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./ketamine-therapy-model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_steps=100
)

# Create trainer
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    tokenizer=tokenizer,
    args=training_args
)

# Start training
trainer.train()

# Save the model
trainer.save_model("./ketamine-therapy-model-final")

# Upload to Hugging Face (optional)
model.push_to_hub("YOUR_USERNAME/ketamine-therapy-companion")
tokenizer.push_to_hub("YOUR_USERNAME/ketamine-therapy-companion")
```

### Step 3: Download or Deploy

**Option A:** Download model and use locally
**Option B:** Use on Hugging Face directly (update `server.js`)

---

## 📊 Data Collection for Better Fine-Tuning

### Collecting Quality Training Data

**Sources:**
1. **Real Conversations** (with consent and anonymization)
2. **Therapeutic Protocols** (convert to Q&A format)
3. **Expert Guidelines** (from therapists)
4. **Research Papers** (extract relevant info)

### Data Format

Each training example should have:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a compassionate Ketamine Therapy Companion..."
    },
    {
      "role": "user",
      "content": "User's question or concern"
    },
    {
      "role": "assistant",
      "content": "Therapeutic, evidence-based response"
    }
  ]
}
```

### Quality Guidelines

✅ **Good training data:**
- Evidence-based information
- Empathetic and professional tone
- Clear disclaimers about medical advice
- Varied topics and scenarios
- Consistent therapeutic approach

❌ **Avoid:**
- Medical diagnoses
- Specific dosage recommendations
- Contradictory information
- Personal opinions without evidence
- Harmful or dangerous advice

---

## 🎯 Combining RAG + Fine-Tuning

**Best Practice:** Use BOTH approaches!

1. **Fine-tune** the model for:
   - Therapeutic tone and style
   - Understanding ketamine therapy concepts
   - Consistent response patterns

2. **Use RAG** (knowledge base) for:
   - Latest research and protocols
   - Clinic-specific information
   - Frequently updated content

### Implementation

```javascript
// In server.js - use fine-tuned model with knowledge base

const response = await client.chatCompletion({
  model: 'YOUR_USERNAME/ketamine-therapy-companion', // Fine-tuned model
  messages: [
    {
      role: 'system',
      content: THERAPY_SYSTEM_PROMPT
    },
    {
      role: 'system',
      content: knowledgeBaseContent // RAG context
    },
    {
      role: 'user',
      content: message
    }
  ]
});
```

---

## 💰 Cost Estimates

### AutoTrain
- Small dataset (100 examples): ~$5-10
- Medium dataset (500 examples): ~$20-40
- Large dataset (2000+ examples): ~$50-100

### Google Colab
- Free: Limited GPU hours
- Pro ($10/month): ~20-50 hours GPU
- Pro+ ($50/month): ~100+ hours GPU

### Running Locally
- Need: RTX 3090/4090 or better
- Cost: GPU hardware ($1000-2000)
- Benefit: Unlimited training

---

## 🔄 Training Workflow

```
1. Collect Data (100+ examples)
   ↓
2. Prepare Data (run prepare-training-data.js)
   ↓
3. Choose Method (AutoTrain or Colab)
   ↓
4. Fine-tune Model (2-8 hours)
   ↓
5. Test Model (validate responses)
   ↓
6. Deploy (update server.js)
   ↓
7. Monitor & Iterate (collect more data)
```

---

## 📝 Next Steps

### To Start Fine-Tuning:

1. **Prepare more training data:**
   ```bash
   # Edit fine-tuning/prepare-training-data.js
   # Add 50-100+ examples
   node fine-tuning/prepare-training-data.js
   ```

2. **Choose your method:**
   - AutoTrain: Easiest, good for beginners
   - Colab: More control, free option available
   - Local: Best for privacy and iteration

3. **Run training:**
   - Follow Method 1 or Method 2 above

4. **Test your model:**
   - Use the test scripts provided
   - Compare with base model

5. **Deploy:**
   - Update server.js with your model name
   - Restart server
   - Test with frontend

---

## ❓ FAQ

**Q: Can I fine-tune without GPU?**
A: No, but you can use free Colab GPUs or pay for cloud GPUs.

**Q: How much data do I need?**
A: Minimum 100 examples, ideal 500-1000+ for best results.

**Q: Will fine-tuning replace RAG?**
A: No! Use both. Fine-tuning for style, RAG for updated knowledge.

**Q: Can I fine-tune continuously?**
A: Yes! Collect more data and re-train periodically.

**Q: Is my data secure?**
A: If using cloud services, data is sent to their servers. For privacy-sensitive data, consider local training or on-premise solutions.

---

## 🆘 Support

- **Hugging Face Forum:** https://discuss.huggingface.co/
- **Transformers Documentation:** https://huggingface.co/docs/transformers
- **AutoTrain Docs:** https://huggingface.co/docs/autotrain

---

**Ready to fine-tune?** Start by adding more examples to `prepare-training-data.js`!

