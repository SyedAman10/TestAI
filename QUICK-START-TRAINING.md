# Quick Start: Training Your Custom Model

## 🚀 5-Minute Setup

### 1. Start Your Server
```bash
npm start
```

### 2. Open Training Center
Go to: http://localhost:3000/training.html

### 3. Add Your First Training Example

**Example 1:**
- **User Input**: "What should I expect in my first ketamine therapy session?"
- **Context**: "Pre-session preparation"  
- **Response**: "Your first session will take place in a safe, comfortable environment. A trained therapist will be present throughout. The ketamine will be administered, and you may experience altered perceptions or a sense of floating. These effects are temporary and part of the healing process. Sessions typically last 45-90 minutes. Your therapist will guide you through everything."

Click **"➕ Add Example"**

### 4. Add More Examples (Aim for 100+)

Continue adding examples covering:
- Pre-session questions
- During-session experiences
- Post-session integration
- Side effects and safety
- Treatment protocols
- General education

### 5. Download Your Training Data

Once you have 100+ examples:
1. Select format: **JSONL** (recommended)
2. Click **"💾 Download Training Data"**
3. Save the file

## 🎯 Fine-Tune Your Model

### Option A: Hugging Face AutoTrain (Easiest)

1. Go to https://huggingface.co/autotrain
2. Create an account (free)
3. Click "New Project"
4. Upload your downloaded training file
5. Select model: `meta-llama/Llama-3.1-8B-Instruct`
6. Click "Start Training" (~$10-50)
7. Wait 2-6 hours
8. Get your model name: `your-username/model-name`

### Option B: Google Colab (Free)

1. Go to https://colab.research.google.com/
2. Create new notebook
3. Copy code from `FINE-TUNING-GUIDE.md` (Method 2)
4. Upload your training file
5. Run all cells
6. Download or upload trained model to Hugging Face

## 🔧 Deploy Your Fine-Tuned Model

### Update Your Server

Edit `server.js`:

```javascript
// Find this line (around line 54):
model: 'meta-llama/Llama-3.1-8B-Instruct',

// Replace with:
model: 'your-username/your-model-name',
```

### Restart Server

```bash
npm start
```

### Test It!

1. Go to http://localhost:3000
2. Ask questions
3. Compare responses with base model

## ✅ You Now Have:

1. ✅ **RAG System** - Upload PDFs/documents for immediate knowledge
2. ✅ **Fine-Tuned Model** - Permanent learning customized to your needs
3. ✅ **Training Interface** - Easy way to add more examples
4. ✅ **Complete Pipeline** - From data creation to deployment

## 📚 Full Documentation

- **TRAINING-CENTER-GUIDE.md** - Complete training interface guide
- **FINE-TUNING-GUIDE.md** - Detailed fine-tuning instructions
- **TRAINING-IMPLEMENTATION.md** - Technical implementation details

## 🆘 Troubleshooting

**Can't access training page?**
- Make sure server is running: `npm start`
- Check URL: http://localhost:3000/training.html

**Examples not saving?**
- Check server console for errors
- Verify file permissions on `fine-tuning/` directory

**Download not working?**
- Need at least 1 example
- Check browser download settings

**Training too expensive?**
- Use Google Colab free tier
- Start with smaller dataset
- Use LoRA (efficient fine-tuning method)

## 💡 Pro Tips

1. **Start Small**: Create 10 examples first to test the workflow
2. **Quality > Quantity**: 100 great examples > 1000 mediocre ones
3. **Be Consistent**: Keep therapeutic tone consistent across all examples
4. **Use Both Systems**: RAG for knowledge, fine-tuning for style
5. **Iterate**: Fine-tune, test, collect more data, retrain

## 🎉 Success!

You now have everything needed to:
- Create custom training data
- Fine-tune your own AI model
- Deploy it in your application
- Combine it with RAG for powerful results

**Start adding examples now at:** http://localhost:3000/training.html

---

Questions? Check the detailed guides or server logs for debugging!

