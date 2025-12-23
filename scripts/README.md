# Training Scripts

This folder contains Python scripts for local model fine-tuning and testing.

## 📁 Files

### `train.py`
**Purpose:** Fine-tune Meta Llama 3.1 8B Instruct on your training data

**Requirements:**
- NVIDIA GPU with 16GB+ VRAM
- Python 3.10+
- Dependencies: `pip install -r requirements.txt`
- Hugging Face token with Llama 3.1 access

**Usage:**
```bash
# Set your Hugging Face token
export HUGGINGFACE_TOKEN="your_token_here"

# Run training
python scripts/train.py
```

**What it does:**
1. Loads training data from `fine-tuning/training-data/user-examples.json`
2. Downloads Llama 3.1 8B model (first time only, ~16GB)
3. Applies QLoRA for efficient training
4. Fine-tunes for 3 epochs
5. Saves model to `models/ketamine-therapy-fine-tuned/`

**Training time:** 2-10 hours depending on GPU and data size

**Configuration:** Edit the constants at the top of `train.py` to adjust hyperparameters

---

### `test_model.py`
**Purpose:** Test your fine-tuned model with interactive chat or predefined scenarios

**Requirements:**
- Trained model in `models/ketamine-therapy-fine-tuned/`
- Same Python dependencies as training

**Usage:**
```bash
python scripts/test_model.py
```

**Features:**
- Interactive chat mode
- Predefined test scenarios
- Compare responses to training examples

---

## 🚀 Quick Start

1. **Prepare training data** using the web interface at http://localhost:3000/training.html

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Hugging Face token:**
   ```bash
   export HUGGINGFACE_TOKEN="your_token_here"
   ```

4. **Train the model:**
   ```bash
   python scripts/train.py
   ```

5. **Test the model:**
   ```bash
   python scripts/test_model.py
   ```

---

## 📖 Documentation

- **Complete setup guide:** See `LOCAL-TRAINING-GUIDE.md`
- **Fine-tuning options:** See `FINE-TUNING-GUIDE.md`
- **Training data format:** See `fine-tuning/training-data/README.md`

---

## ⚙️ Customization

### Adjust Training Parameters

Edit `train.py` to modify:

```python
LEARNING_RATE = 2e-4              # Learning rate
BATCH_SIZE = 4                    # Batch size (reduce if OOM)
NUM_EPOCHS = 3                    # Number of training epochs
MAX_SEQ_LENGTH = 512              # Maximum sequence length
LORA_R = 16                       # LoRA rank
```

### Memory Issues?

If you get "CUDA out of memory" errors:

1. Reduce `BATCH_SIZE` to 2 or 1
2. Reduce `MAX_SEQ_LENGTH` to 256
3. Reduce `LORA_R` to 8

---

## 🐛 Troubleshooting

### "No module named 'transformers'"
```bash
pip install -r requirements.txt
```

### "CUDA out of memory"
Edit `train.py` and reduce `BATCH_SIZE` and `MAX_SEQ_LENGTH`

### "Could not load model"
- Ensure Hugging Face token is set
- Request access to Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

### "Training data file not found"
Create training examples at http://localhost:3000/training.html

---

## 🎯 After Training

Once training completes, you can:

1. **Test locally:** `python scripts/test_model.py`

2. **Upload to Hugging Face Hub:**
   ```bash
   huggingface-cli upload your-username/model-name ./models/ketamine-therapy-fine-tuned/
   ```

3. **Use in your Node.js app:** Update `server.js` to use your fine-tuned model

---

## 💡 Tips

- **Start small:** Begin with 100-200 examples to validate your setup
- **Monitor training:** Watch the loss decrease in the terminal
- **Quality > Quantity:** 100 high-quality examples beat 1000 poor ones
- **Iterate:** Train, test, add more targeted examples, retrain

---

## 📚 Additional Resources

- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [PEFT Library](https://huggingface.co/docs/peft)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [Llama 3.1 Documentation](https://ai.meta.com/blog/meta-llama-3-1/)

