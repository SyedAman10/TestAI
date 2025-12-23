# 🖥️ Local Training Guide - Ketamine Therapy Companion

This guide explains how to fine-tune **Meta Llama 3.1 8B Instruct** (the same model used for RAG) on your own machine.

---

## ⚠️ Prerequisites

### Hardware Requirements

**Minimum (with QLoRA):**
- NVIDIA GPU with 16GB+ VRAM (e.g., RTX 4090, A4000, V100)
- 32GB System RAM
- 50GB free disk space

**Recommended:**
- NVIDIA GPU with 24GB+ VRAM (e.g., RTX 4090, A5000, A100)
- 64GB System RAM
- 100GB free disk space
- Fast SSD

**Can't meet these requirements?** Use Google Colab (see `FINE-TUNING-GUIDE.md`) or Hugging Face AutoTrain instead.

### Software Requirements

1. **Python 3.10+**
   ```bash
   python --version  # Should be 3.10 or higher
   ```

2. **CUDA Toolkit** (for NVIDIA GPU)
   ```bash
   # Check if CUDA is installed
   nvcc --version
   
   # Or check with nvidia-smi
   nvidia-smi
   ```
   
   If not installed, download from: https://developer.nvidia.com/cuda-downloads

3. **Hugging Face Account & Token**
   - Create account: https://huggingface.co/join
   - Request access to Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
   - Create token: https://huggingface.co/settings/tokens (needs "read" permission)

---

## 🚀 Quick Start

### Step 1: Install Python Dependencies

```bash
# Install PyTorch with CUDA support first
# Visit https://pytorch.org/get-started/locally/ for your specific setup
# Example for CUDA 12.1:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install other dependencies
pip install -r requirements.txt
```

### Step 2: Set Hugging Face Token

**Windows (PowerShell):**
```powershell
$env:HUGGINGFACE_TOKEN="your_token_here"
```

**Linux/Mac:**
```bash
export HUGGINGFACE_TOKEN="your_token_here"
```

**Or add to .env file:**
```bash
echo "HUGGINGFACE_TOKEN=your_token_here" >> .env
```

### Step 3: Prepare Training Data

Use the web interface at http://localhost:3000/training.html to:
- Add training examples manually
- Upload existing training data (JSON, JSONL, CSV, PDF, etc.)
- Aim for at least **100 examples** (500+ recommended)

Or edit the examples in:
```bash
node fine-tuning/prepare-training-data.js
```

### Step 4: Start Training

```bash
python scripts/train.py
```

**What happens:**
1. ✅ Checks GPU availability
2. ✅ Loads training data from `fine-tuning/training-data/user-examples.json`
3. ✅ Downloads Llama 3.1 8B model (~16GB, first time only)
4. ✅ Applies QLoRA for efficient training
5. ✅ Trains for 3 epochs
6. ✅ Saves fine-tuned model to `models/ketamine-therapy-fine-tuned/`

**Training time estimates:**
- RTX 4090: 2-6 hours (100-500 examples)
- RTX 3090: 4-10 hours
- V100: 3-8 hours
- CPU: Don't. Use Colab instead.

---

## ⚙️ Configuration

Edit `scripts/train.py` to customize:

```python
# Training hyperparameters
LEARNING_RATE = 2e-4        # Lower = more stable, higher = faster convergence
BATCH_SIZE = 4              # Reduce if out of memory
GRADIENT_ACCUMULATION_STEPS = 4  # Effective batch = BATCH_SIZE * this
NUM_EPOCHS = 3              # More epochs = more training (risk overfitting)
MAX_SEQ_LENGTH = 512        # Maximum tokens per example

# LoRA parameters
LORA_R = 16                 # LoRA rank (higher = more parameters to train)
LORA_ALPHA = 32             # LoRA scaling
LORA_DROPOUT = 0.05         # Dropout for regularization
```

### Common Adjustments

**Out of Memory?**
- Reduce `BATCH_SIZE` to 2 or 1
- Reduce `MAX_SEQ_LENGTH` to 256
- Reduce `LORA_R` to 8

**Training too slow?**
- Increase `BATCH_SIZE` (if you have memory)
- Reduce `NUM_EPOCHS` to 2

**Model not learning well?**
- Increase `NUM_EPOCHS` to 5
- Increase `LORA_R` to 32
- Add more training examples
- Check training data quality

---

## 📊 Monitoring Training

The script outputs:
```
🔥 Training started...
======================================================================
{'loss': 2.345, 'learning_rate': 0.0002, 'epoch': 0.1}
{'loss': 1.892, 'learning_rate': 0.00019, 'epoch': 0.2}
{'loss': 1.654, 'learning_rate': 0.00018, 'epoch': 0.3}
...
```

**What to look for:**
- ✅ **Loss decreasing**: Model is learning
- ⚠️ **Loss stuck**: Need more epochs or better data
- ❌ **Loss increasing**: Learning rate too high or data issues

---

## 🎯 Using Your Fine-Tuned Model

### Option 1: Use Locally in Node.js

You'll need to switch from the Hugging Face API to local inference. This requires:

1. Install additional Node.js packages for local inference
2. Load the model from `models/ketamine-therapy-fine-tuned/`
3. Modify `server.js` to use local model instead of API

**Note:** Running the 8B model locally requires the same GPU requirements as training.

### Option 2: Upload to Hugging Face Hub (Recommended)

```bash
# Install Hugging Face CLI
pip install huggingface_hub

# Login
huggingface-cli login

# Upload your model
huggingface-cli upload your-username/ketamine-therapy-companion ./models/ketamine-therapy-fine-tuned/
```

Then update `server.js`:

```javascript
// Change from:
model: 'meta-llama/Llama-3.1-8B-Instruct',

// To:
model: 'your-username/ketamine-therapy-companion',
```

### Option 3: Use with Ollama (Easy Local Inference)

1. Convert to GGUF format
2. Create Ollama model
3. Run locally without GPU

See: https://github.com/ollama/ollama

---

## 🐛 Troubleshooting

### "CUDA out of memory"
```python
# In train.py, reduce:
BATCH_SIZE = 1
MAX_SEQ_LENGTH = 256
LORA_R = 8
```

### "No module named 'transformers'"
```bash
pip install -r requirements.txt
```

### "Could not load model meta-llama/Llama-3.1-8B-Instruct"
- Ensure you have Hugging Face token set
- Request access: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Wait for approval (usually instant)

### "Training data file not found"
- Create examples at: http://localhost:3000/training.html
- Or run: `node fine-tuning/prepare-training-data.js`

### Model not performing well after training
1. **Check training data quality:**
   - Examples should be high-quality, therapeutic responses
   - Consistent style and tone
   - Accurate information

2. **Add more examples:**
   - 50 examples: Minimal, won't work well
   - 100 examples: Okay for basic fine-tuning
   - 500 examples: Good results
   - 1000+ examples: Excellent results

3. **Train longer:**
   - Increase `NUM_EPOCHS` to 5-10

4. **Use better base prompts in training data**

---

## 📈 Training Best Practices

### 1. Data Quality > Quantity
- ✅ 100 high-quality examples > 1000 mediocre ones
- ✅ Consistent therapeutic style
- ✅ Accurate medical information
- ✅ Varied scenarios and questions

### 2. Start Small, Iterate
1. Train on 50-100 examples first
2. Test the model
3. Identify weaknesses
4. Add targeted examples
5. Retrain

### 3. Monitor for Overfitting
- If loss gets very low (< 0.5) but model seems robotic, it's overfitting
- Solution: Add more diverse examples or reduce epochs

### 4. Version Control Your Models
- Save each trained model with a version number
- Keep notes on what data was used
- Compare performance between versions

---

## 💰 Cost Comparison

| Method | Cost | Time | GPU Required | Difficulty |
|--------|------|------|--------------|------------|
| **Local (this guide)** | Hardware cost | 2-10 hours | Yes (16GB+) | Medium |
| **Google Colab Free** | Free* | 3-12 hours | No | Easy |
| **Google Colab Pro** | $10/month | 2-8 hours | No | Easy |
| **Hugging Face AutoTrain** | $5-50/job | 1-6 hours | No | Very Easy |
| **AWS/GCP/Azure** | $1-5/hour | 2-10 hours | No | Hard |

*Free tier has limited GPU hours per day

---

## 📚 Additional Resources

- **Hugging Face Docs**: https://huggingface.co/docs/transformers
- **PEFT Library**: https://huggingface.co/docs/peft
- **LoRA Paper**: https://arxiv.org/abs/2106.09685
- **Llama 3.1**: https://ai.meta.com/blog/meta-llama-3-1/

---

## 🆘 Need Help?

1. Check the error message carefully
2. Search for the error on Google/Stack Overflow
3. Review the Hugging Face forums
4. Check GPU memory usage: `nvidia-smi`
5. Review training data format

---

## ✨ What's Next?

After successful training:

1. **Test Your Model**
   - Try various therapeutic scenarios
   - Compare responses to base model
   - Get feedback from domain experts

2. **Deploy**
   - Upload to Hugging Face Hub
   - Update your Node.js app
   - Monitor real-world performance

3. **Iterate**
   - Collect more real conversations
   - Identify gaps in knowledge
   - Retrain with improved data

Good luck with your fine-tuning! 🚀

