# 🧠 Ketamine Therapy Companion - Complete System

An AI-powered companion system for ketamine-assisted therapy with RAG (document upload) and fine-tuning capabilities.

---

## ⚠️ IMPORTANT MEDICAL DISCLAIMER

**THIS SOFTWARE IS NOT A MEDICAL DEVICE OR A REPLACEMENT FOR PROFESSIONAL HEALTHCARE**

- Always consult with licensed medical professionals
- Do not use for medical diagnoses or treatment decisions
- In emergencies, call 911 or your local emergency services
- This tool is for educational and supportive purposes only

---

## 🌟 Features

### ✅ Core Capabilities

1. **Therapeutic Chat Interface**
   - Compassionate, trauma-informed responses
   - Context-aware conversations
   - Evidence-based information

2. **RAG System (Knowledge Base)**
   - Upload therapy protocols and resources
   - Automatic integration with AI responses
   - Real-time knowledge updates

3. **File Upload & Management**
   - Web-based document upload
   - Support for txt, md, json, csv files
   - Document library management

4. **Fine-Tuning Preparation**
   - Training data templates
   - Multiple format support
   - Complete fine-tuning guide

5. **Beautiful Web Interface**
   - Modern, responsive design
   - Easy-to-use chat interface
   - Document management dashboard

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Express (API server)
- Hugging Face Inference SDK
- Multer (file uploads)
- CORS, dotenv

### 2. Configure API Key

Create `.env` file:

```env
HUGGINGFACE_API_KEY=your_hugging_face_api_key_here
PORT=3000
```

Get your API key: https://huggingface.co/settings/tokens

### 3. Start the Server

```bash
npm start
```

### 4. Open the Frontend

Visit: http://localhost:3000/index.html

You should see the Ketamine Therapy Companion interface!

---

## 📚 How to Use

### Option 1: Basic Chat (No Documents)

1. Open http://localhost:3000/index.html
2. Type your message in the chat box
3. Select a session context (optional)
4. Uncheck "Use uploaded documents"
5. Click "Send Message"

### Option 2: Chat with Documents (RAG)

1. Upload therapy resources:
   - Click the upload area
   - Select txt/md/json/csv files
   - Wait for upload confirmation

2. Chat with knowledge base:
   - Keep "Use uploaded documents" checked
   - Ask questions about your uploaded resources
   - AI will reference your documents in responses

### Option 3: Fine-Tuning (Advanced)

See `FINE-TUNING-GUIDE.md` for complete instructions.

**Quick version:**
```bash
# 1. Add training examples
# Edit: fine-tuning/prepare-training-data.js

# 2. Generate training data
node fine-tuning/prepare-training-data.js

# 3. Follow FINE-TUNING-GUIDE.md
# Use AutoTrain or Google Colab
```

---

## 🎯 API Endpoints

### Therapeutic Chat
```bash
POST /api/therapy/chat
Content-Type: application/json

{
  "message": "I'm anxious about my session",
  "session_context": "Pre-session preparation",
  "max_tokens": 800,
  "temperature": 0.7
}
```

### Chat with Documents (RAG)
```bash
POST /api/therapy/chat-with-docs
Content-Type: application/json

{
  "message": "What does the protocol say about integration?",
  "use_knowledge_base": true,
  "max_tokens": 1000
}
```

### Upload Document
```bash
POST /api/therapy/upload
Content-Type: multipart/form-data

file: [your file]
```

### List Documents
```bash
GET /api/therapy/documents
```

### Delete Document
```bash
DELETE /api/therapy/documents/:filename
```

### Get Knowledge Base
```bash
GET /api/therapy/knowledge-base
```

---

## 📁 Project Structure

```
AI_BRAIN/
├── server.js                          # Main API server
├── package.json                       # Dependencies
├── .env                              # Configuration (create this)
│
├── public/
│   └── index.html                    # Web interface
│
├── uploads/                          # Temporary uploads
├── knowledge-base/                   # Stored documents (RAG)
│
├── fine-tuning/
│   ├── prepare-training-data.js     # Training data generator
│   └── training-data/               # Generated datasets
│
├── KETAMINE-THERAPY-COMPANION-README.md  # This file
├── FINE-TUNING-GUIDE.md             # Fine-tuning instructions
├── TRAINING-GUIDE.md                # RAG vs Fine-tuning guide
└── README.md                        # Original technical docs
```

---

## 🎨 Customizing the System

### 1. Modify Therapeutic Prompts

Edit `server.js`, find `THERAPY_SYSTEM_PROMPT`:

```javascript
const THERAPY_SYSTEM_PROMPT = `
You are a compassionate...
[customize this text]
`;
```

### 2. Change Session Contexts

Edit `public/index.html`, find the context dropdown:

```html
<select id="context-select">
  <option value="">General Support</option>
  <option value="...">Add your contexts here</option>
</select>
```

### 3. Add More Training Examples

Edit `fine-tuning/prepare-training-data.js`:

```javascript
const trainingExamples = [
  {
    instruction: "User question",
    context: "Context/scenario",
    response: "Desired AI response"
  },
  // Add more examples...
];
```

### 4. Change AI Model

Edit `server.js`:

```javascript
// Current model
model: 'meta-llama/Llama-3.1-8B-Instruct',

// Other options:
// model: 'meta-llama/Llama-3.1-70B-Instruct',  // Larger, better
// model: 'Qwen/Qwen2.5-7B-Instruct',           // Fast alternative
// model: 'YOUR_USERNAME/your-finetuned-model', // Your fine-tuned model
```

---

## 💡 Use Cases

### For Therapists
- Educational resource for patients
- Session preparation tool
- Integration support
- Evidence-based information delivery

### For Patients
- Pre-session preparation
- Post-session integration
- Understanding the process
- Emotional support between sessions

### For Clinics
- Standardized information delivery
- Protocol documentation
- Patient education
- Reduced FAQ burden on staff

---

## 🔒 Privacy & Security

### Current Setup
- All data stored locally
- No third-party databases
- Files saved on your server
- API calls to Hugging Face only

### For Production Use

**Important considerations:**
1. ✅ Use HTTPS (SSL certificates)
2. ✅ Add authentication (user login)
3. ✅ Implement rate limiting
4. ✅ Encrypt stored files
5. ✅ HIPAA compliance if needed
6. ✅ Regular security audits
7. ✅ Backup systems

**Not production-ready out-of-the-box!** This is a development prototype.

---

## 📊 RAG vs Fine-Tuning Decision Matrix

| Need | Solution | Implementation Time |
|------|----------|-------------------|
| Use therapy protocols | RAG | ✅ Ready now |
| Clinic-specific info | RAG | ✅ Ready now |
| Custom therapeutic style | Fine-tuning | ⏱️ 1-2 days |
| Domain expertise | Fine-tuning | ⏱️ 1-2 days |
| Frequently updated content | RAG | ✅ Ready now |
| Permanent behavior change | Fine-tuning | ⏱️ 1-2 days |

**Recommendation:** Start with RAG, add fine-tuning later if needed.

---

## 🧪 Testing

### Test Basic Chat
```bash
# Start server
npm start

# In another terminal
curl -X POST http://localhost:3000/api/therapy/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is ketamine therapy?"}'
```

### Test File Upload
1. Open http://localhost:3000/index.html
2. Click upload area
3. Select a .txt file
4. Verify in "Uploaded Documents" section

### Test RAG
1. Upload a document
2. Ask a question about the document
3. Keep "Use uploaded documents" checked
4. Verify AI references your document

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Try different port
# Edit .env: PORT=3001
```

### API Key Issues
```bash
# Verify key in .env file
cat .env

# Test key directly
curl https://huggingface.co/api/whoami-v2 \
  -H "Authorization: Bearer YOUR_KEY"
```

### File Upload Fails
- Check file size (max 10MB)
- Verify file format (.txt, .md, .json, .csv)
- Check disk space
- Check uploads/ directory permissions

### AI Responses Are Generic
- Upload relevant therapy documents
- Use "Chat with documents" endpoint
- Consider fine-tuning for better results
- Adjust system prompts

---

## 🚀 Production Deployment

### Recommended Stack

**Backend:**
- Node.js server (this project)
- PostgreSQL database (for user data)
- Redis (for caching)

**Frontend:**
- React/Vue.js (more robust than static HTML)
- Authentication system
- User session management

**Infrastructure:**
- Docker containers
- Load balancer
- CDN for static assets
- Backup systems

**Security:**
- HTTPS/SSL
- OAuth2 authentication
- Input validation
- Rate limiting
- HIPAA compliance (if needed)

### Deployment Platforms

**Easy:**
- Heroku
- Railway
- Render

**Advanced:**
- AWS (EC2, ECS)
- Google Cloud
- Azure

See deployment guides for your chosen platform.

---

## 📈 Future Enhancements

### Planned Features
- [ ] User authentication
- [ ] Conversation history
- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Mobile app
- [ ] Therapist dashboard
- [ ] Analytics & insights
- [ ] Integration with EHR systems

### Contributing
Want to add features? Fork the repo and submit pull requests!

---

## 📖 Additional Resources

### Documentation
- `README.md` - Technical documentation
- `TRAINING-GUIDE.md` - RAG vs Fine-tuning comparison
- `FINE-TUNING-GUIDE.md` - Complete fine-tuning instructions

### External Links
- [Hugging Face Docs](https://huggingface.co/docs)
- [Ketamine Therapy Research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8632986/)
- [Trauma-Informed Care](https://www.samhsa.gov/trauma-violence)

---

## 🤝 Support

### Issues
Having problems? Check:
1. This README
2. TROUBLESHOOTING section
3. GitHub Issues

### Questions
- General: See documentation
- Technical: Open an issue
- Clinical: Consult licensed professionals

---

## ⚖️ License

ISC License - See package.json

**Medical Disclaimer:** This software is provided "as is" without warranty. Not for diagnostic or treatment purposes.

---

## 🎓 Credits

Built with:
- Hugging Face Inference API
- Meta Llama 3.1
- Express.js
- Modern web technologies

Designed for: Supporting ketamine-assisted therapy patients and providers

---

**Ready to get started?** 

1. `npm install`
2. Configure `.env`
3. `npm start`
4. Open http://localhost:3000/index.html

**Have questions?** Check the guides or open an issue!

---

Made with ❤️ for the therapeutic community

