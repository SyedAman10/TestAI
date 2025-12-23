# Training Center User Guide

## 🎯 Overview

The **Training Center** (`training.html`) allows you to prepare training data for fine-tuning your own custom AI model. This works alongside the RAG (Retrieval Augmented Generation) system you already have.

## 🔄 RAG vs Fine-Tuning

### What You Already Have: RAG
- ✅ **Real-time knowledge**: Upload PDFs/documents anytime
- ✅ **No training needed**: Works immediately
- ✅ **Easy updates**: Add new files as needed
- ✅ **Perfect for**: Latest protocols, research papers, clinic guidelines

### What Training Adds: Fine-Tuning
- ✅ **Permanent learning**: Model behavior becomes customized
- ✅ **Style consistency**: Learn your therapeutic approach
- ✅ **Domain expertise**: Better understanding of therapy concepts
- ✅ **No context needed**: Knowledge embedded in the model

### Best Practice: Use BOTH! 🚀
1. **Fine-tune** for therapeutic style and approach
2. **Use RAG** for up-to-date protocols and research

## 📖 How to Use the Training Center

### 1. Access the Training Page
- Go to http://localhost:3000/training.html
- Or click "🧠 Model Training" button from the chat interface

### 2. Add Training Examples

**Manual Entry:**
1. Fill in the form:
   - **User Question/Input**: What a patient might ask
   - **Context** (optional): e.g., "Pre-session preparation"
   - **Expected AI Response**: Your ideal therapeutic response

2. Click "➕ Add Example"

**Example:**
```
User Input: "I'm anxious about my first session"
Context: "Pre-session preparation"
Response: "It's completely natural to feel anxious. Here's what to expect..."
```

### 3. Upload Existing Training Data

If you already have training data:
1. Click the upload area
2. Select your file (.json, .jsonl, .csv)
3. System automatically imports examples

**Supported Formats:**
- **JSONL**: OpenAI/Hugging Face format
- **Alpaca JSON**: LLaMA fine-tuning format
- **Chat JSON**: Conversation format

### 4. Review Your Data

- All examples appear in the list below
- Check for quality and consistency
- Delete any problematic examples
- View statistics to track progress

### 5. Download Training Data

When ready (minimum 100 examples):
1. Select format from dropdown:
   - **JSONL**: For Hugging Face AutoTrain
   - **Alpaca**: For LLaMA fine-tuning
   - **Chat**: For conversation-based training

2. Click "💾 Download Training Data"
3. You'll get a properly formatted file ready for training

## 📊 Training Readiness

### Minimum Requirements
- ✅ **100 examples**: Bare minimum for fine-tuning
- ✅ **500+ examples**: Recommended for best results
- ✅ **Quality responses**: 50-3000 characters each
- ✅ **Consistency**: Same therapeutic style throughout

### Statistics Dashboard
The page shows:
- **Total Examples**: How many you've created
- **Avg Response Length**: Quality indicator
- **Training Readiness**: Percentage ready to train

## 🚀 Fine-Tuning Workflow

### Step 1: Prepare Data (This Interface)
✅ Create or upload 100-1000+ training examples
✅ Review and ensure quality
✅ Download in your preferred format

### Step 2: Choose Training Platform

**Option A: Hugging Face AutoTrain (Easiest)**
- Click "🤗 Open Hugging Face AutoTrain"
- Upload your training data
- Select base model: `meta-llama/Llama-3.1-8B-Instruct`
- Start training (~$10-50 depending on data size)

**Option B: Google Colab (Free/Paid)**
- Click "📓 Open Google Colab"
- Upload your training data file
- Follow the notebook in `FINE-TUNING-GUIDE.md`
- Free tier available with limited GPU time

**Option C: Local Training**
- Requires GPU (RTX 3090 or better)
- Full control and privacy
- See `FINE-TUNING-GUIDE.md` for setup

### Step 3: Train Your Model
- Training takes 2-8 hours depending on:
  - Number of examples
  - GPU power
  - Model size
  
### Step 4: Deploy Your Model
Once training completes:

1. **Get your model name** from Hugging Face
   - Format: `your-username/ketamine-therapy-companion`

2. **Update server.js**:
```javascript
// Change this:
model: 'meta-llama/Llama-3.1-8B-Instruct',

// To this:
model: 'your-username/ketamine-therapy-companion',
```

3. **Restart your server**
```bash
npm start
```

4. **Test with chat interface** - Your model now has permanent learning!

## 💡 Creating Quality Training Data

### Good Examples ✅

**Example 1: Pre-Session Anxiety**
```
User: "I'm nervous about my session tomorrow. What should I do?"
Context: "Pre-session preparation"
Response: "Pre-session nervousness is completely normal and shows you're taking this seriously. Here's how to prepare: 1) Set a positive intention for what you want to work on. 2) Ensure you've followed fasting guidelines if required. 3) Arrange transportation home. 4) Create a comfortable space for integration afterward. 5) Trust the process - your therapist will guide you through everything. Would you like specific relaxation techniques for tonight?"
```

**Example 2: Understanding Treatment**
```
User: "How does ketamine therapy actually work?"
Context: "Education about mechanism"
Response: "Ketamine works through several mechanisms: 1) It acts on glutamate receptors in the brain, particularly NMDA receptors, which helps create new neural pathways. 2) This 'neuroplasticity' allows your brain to form new, healthier thought patterns. 3) It can rapidly reduce symptoms of depression and PTSD. 4) The dissociative experience during treatment can provide psychological insights. 5) When combined with therapy, these insights can lead to lasting change. The effects are both biological (brain chemistry) and psychological (therapeutic insights)."
```

### What to Avoid ❌

❌ **Too short**: "You'll be fine."
❌ **Medical advice**: "Take 50mg before your session"
❌ **Inconsistent tone**: Switching between formal and casual
❌ **Dangerous info**: Anything that could cause harm
❌ **Personal opinions**: Stick to evidence-based information

### Tips for Quality Data

1. **Be Empathetic**: Show understanding and compassion
2. **Be Informative**: Provide evidence-based information
3. **Be Safe**: Always include appropriate disclaimers
4. **Be Consistent**: Maintain the same therapeutic style
5. **Be Thorough**: Answer completely but concisely
6. **Be Ethical**: Never diagnose or prescribe

## 🔐 Data Privacy

- All training data is stored locally on your server
- In directory: `fine-tuning/training-data/user-examples.json`
- Not sent anywhere unless you explicitly upload for training
- When using external training services (AutoTrain, Colab):
  - Your data will be sent to those platforms
  - Review their privacy policies
  - Consider anonymizing sensitive information

## 🛠️ API Endpoints

If building custom tools, these endpoints are available:

```javascript
// Get all examples
GET /api/training/examples

// Add an example
POST /api/training/add-example
Body: { instruction, context, response }

// Delete an example
DELETE /api/training/examples/:index

// Clear all examples
POST /api/training/clear

// Download training data
GET /api/training/download/:format
Formats: jsonl, alpaca, chat

// Upload training data
POST /api/training/upload
Form-data: file

// Get statistics
GET /api/training/stats
```

## 📚 Resources

- **Complete Fine-Tuning Guide**: `FINE-TUNING-GUIDE.md`
- **Training Overview**: `TRAINING-GUIDE.md`
- **Hugging Face Docs**: https://huggingface.co/docs
- **AutoTrain**: https://huggingface.co/autotrain
- **Transformers Guide**: https://huggingface.co/docs/transformers/training

## ❓ FAQ

**Q: Do I need to stop using RAG if I fine-tune?**
A: No! Keep using both. Fine-tuning customizes the model's behavior and style, while RAG provides up-to-date knowledge from your documents.

**Q: How much does fine-tuning cost?**
A: 
- AutoTrain: $5-100 depending on dataset size
- Google Colab: Free tier available, Pro $10/month
- Local: Free but requires GPU ($1000-2000 hardware)

**Q: How long does training take?**
A: 2-8 hours typically, depending on data size and compute power.

**Q: Can I train without a GPU?**
A: No, but you can use cloud GPUs from Colab or AutoTrain.

**Q: How many examples do I really need?**
A: 
- Minimum: 100 examples
- Good: 500 examples
- Best: 1000+ examples

**Q: What if I don't have training data?**
A: Start by creating examples manually in the interface. Aim for scenarios you encounter frequently in therapy. You can also convert your knowledge base documents into Q&A format.

**Q: Is my training data secure?**
A: It's stored locally on your server. Only sent externally if you upload it to training platforms. Always review privacy policies of external services.

**Q: Can I update my model after training?**
A: Yes! Add more examples and retrain. You can do this periodically to improve your model.

## 🆘 Troubleshooting

**Problem: Can't add examples**
- Check server is running: `npm start`
- Check console for errors (F12)
- Verify API URL is correct

**Problem: Upload fails**
- Check file format (JSON/JSONL)
- Verify file structure matches expected format
- Look at server logs for specific errors

**Problem: Download doesn't start**
- Ensure you have at least 1 example
- Check browser's download settings
- Try different format

**Problem: Training readiness shows 0%**
- You need at least 1 example for any progress
- 100 examples = 20% ready
- 500 examples = 100% ready

## 🎯 Next Steps

1. **Start small**: Create 5-10 examples to understand the format
2. **Review quality**: Make sure responses are helpful and consistent
3. **Scale up**: Aim for 100+ examples minimum
4. **Download**: Get your training data in the right format
5. **Follow guide**: Use `FINE-TUNING-GUIDE.md` for actual training
6. **Test**: Compare fine-tuned model with base model
7. **Deploy**: Update your server to use the new model
8. **Iterate**: Keep improving with more examples

---

**Ready to start?** Open http://localhost:3000/training.html and add your first training example!





