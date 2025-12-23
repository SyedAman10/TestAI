# ⚡ Quick Start - Ketamine Therapy Companion

Get up and running in 5 minutes!

---

## 📋 Prerequisites

- ✅ Node.js installed (v16+)
- ✅ Hugging Face account (free)
- ✅ Hugging Face API key

---

## 🚀 Setup (5 Minutes)

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Configure API Key (1 min)

Create `.env` file:

```env
HUGGINGFACE_API_KEY=hf_your_key_here
PORT=3000
```

**Get your API key:**
1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Copy the token
4. Paste into `.env` file

### Step 3: Start Server (1 min)

```bash
npm start
```

You should see:

```
============================================================
🧠  KETAMINE THERAPY COMPANION API
============================================================
🚀  Server: http://localhost:3000
🌐  Frontend: http://localhost:3000/index.html
📝  Model: Meta Llama 3.1 8B Instruct
🔑  API Key: ✓ Configured
============================================================
```

### Step 4: Open Frontend (1 min)

Open in your browser:
```
http://localhost:3000/index.html
```

### Step 5: Start Chatting! (1 min)

1. Type a message like: "What is ketamine therapy?"
2. Click "Send Message"
3. Wait for AI response

**Done!** 🎉

---

## 📤 Upload Documents (Optional)

1. Click the upload area
2. Select a `.txt`, `.md`, `.json`, or `.csv` file
3. Wait for confirmation
4. Ask questions about your document
5. Keep "Use uploaded documents" checked

---

## 🧪 Test the API

```bash
curl -X POST http://localhost:3000/api/therapy/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What should I expect in my first session?"}'
```

---

## 🎯 What's Next?

### Use RAG (Recommended First)
- Upload therapy protocols
- Add educational resources
- Build knowledge base
- See: `TRAINING-GUIDE.md`

### Try Fine-Tuning (Advanced)
- Add training examples
- Generate training data
- Fine-tune model
- See: `FINE-TUNING-GUIDE.md`

### Customize
- Edit system prompts in `server.js`
- Modify frontend in `public/index.html`
- Add session contexts
- Change AI model

---

## 🆘 Problems?

### Server won't start
```bash
# Check if something is using port 3000
netstat -ano | findstr :3000

# Use different port
# Edit .env: PORT=3001
```

### API key not working
- Check for typos in `.env`
- Make sure key starts with `hf_`
- Verify key at https://huggingface.co/settings/tokens

### Can't access frontend
- Make sure server is running
- Try: http://localhost:3000/index.html
- Check browser console for errors

### AI not responding
- Check server logs for errors
- Verify internet connection
- Try different model in `server.js`

---

## 📚 Full Documentation

- **Quick Start** (this file) - Get started fast
- **KETAMINE-THERAPY-COMPANION-README.md** - Complete system docs
- **TRAINING-GUIDE.md** - RAG vs Fine-tuning
- **FINE-TUNING-GUIDE.md** - Fine-tuning instructions

---

**That's it! You're ready to go! 🚀**

Start chatting with your AI therapy companion at:
👉 http://localhost:3000/index.html

