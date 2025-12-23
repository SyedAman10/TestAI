# Ketamine Therapy Companion API

A Node.js API connected to Hugging Face LLM with RAG (Retrieval-Augmented Generation) support for custom documents. This application provides therapeutic conversation AI with knowledge base management.

## Features

- 🧠 **Smart Chunking RAG** for large documents
- 📄 **PDF Support** with text extraction
- 💬 **Therapeutic Conversation AI** powered by Meta Llama 3.1
- 📚 **Knowledge Base Management**
- 🔄 **Training Center** for fine-tuning examples
- 🖥️ **Local Model Fine-Tuning** with GPU support
- 🚀 **Easy Deployment** on Ubuntu servers

## Quick Start (Local Development)

### Prerequisites

- Node.js 18.x or later
- Hugging Face API key ([Get one here](https://huggingface.co/settings/tokens))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd TestAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Hugging Face API key:
   ```
   HUGGINGFACE_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - API: http://localhost:3000
   - Frontend: http://localhost:3000/index.html
   - Training Center: http://localhost:3000/training.html

## Ubuntu Server Deployment

For production deployment on Ubuntu server, see **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions.

### Quick Ubuntu Setup

```bash
# Make scripts executable
chmod +x setup-ubuntu.sh deploy-ubuntu.sh

# Run setup
./setup-ubuntu.sh

# Configure your API key in .env
nano .env

# Deploy with PM2 (production)
./deploy-ubuntu.sh
```

## API Endpoints

### Therapy Routes
- `POST /api/therapy/chat` - Therapeutic conversation with context
- `POST /api/therapy/upload` - Upload documents to knowledge base

### General Routes
- `POST /api/chat` - General chat without therapy context
- `POST /api/upload` - Upload documents for RAG

### Training Routes
- `POST /api/training/examples` - Save training examples
- `GET /api/training/examples` - Retrieve training examples

## Project Structure

```
TestAI/
├── server.js                 # Main server file
├── routes/
│   ├── therapy.js           # Therapy-specific routes
│   ├── general.js           # General chat routes
│   └── training.js          # Training data routes
├── scripts/
│   ├── train.py             # Local model training (Python)
│   ├── test_model.py        # Test fine-tuned model
│   ├── compare_models.py    # Compare base vs fine-tuned
│   └── README.md            # Scripts documentation
├── config/
│   └── prompts.js           # System prompts
├── utils/
│   ├── chunking.js          # Document chunking logic
│   ├── pdfParser.js         # PDF parsing utilities
│   └── tokenEstimator.js    # Token estimation
├── middleware/
│   └── upload.js            # File upload middleware
├── public/
│   ├── index.html           # Main frontend
│   └── training.html        # Training center UI
├── fine-tuning/
│   ├── prepare-training-data.js  # Training data preparation
│   └── training-data/            # Training examples storage
├── models/                  # Fine-tuned models (created after training)
├── knowledge-base/          # Uploaded documents
├── uploads/                 # Temporary uploads
├── requirements.txt         # Python dependencies
├── .env.example             # Environment template
├── setup-ubuntu.sh          # Ubuntu setup script
├── deploy-ubuntu.sh         # Production deployment script
└── Documentation/
    ├── DEPLOYMENT.md             # Deployment guide
    ├── LOCAL-TRAINING-GUIDE.md   # Local training setup
    └── FINE-TUNING-GUIDE.md      # Fine-tuning options
```

## Available Scripts

### Node.js Scripts
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm test` - Test the API
- `npm run example` - Run example with files
- `npm run prepare-training` - Prepare training data

### Python Scripts (Local Training)
- `python scripts/train.py` - Train Llama 3.1 8B locally
- `python scripts/test_model.py` - Test your fine-tuned model
- `python scripts/compare_models.py` - Compare base vs fine-tuned

See [LOCAL-TRAINING-GUIDE.md](LOCAL-TRAINING-GUIDE.md) for setup instructions.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HUGGINGFACE_API_KEY` | Yes | - | Your Hugging Face API key |
| `PORT` | No | 3000 | Server port |

## Security

- ✅ `.env` files are excluded from Git
- ✅ Uploads directory is gitignored
- ✅ Environment variables template provided
- ✅ No sensitive data in repository

**Never commit your `.env` file!** It's already in `.gitignore` to protect your API keys.

## Documentation

- [Quick Start Guide](QUICK-START.md)
- [Training Guide](TRAINING-GUIDE.md)
- [Local Training Guide](LOCAL-TRAINING-GUIDE.md) ⭐ NEW
- [Fine-Tuning Guide](FINE-TUNING-GUIDE.md)
- [Ubuntu Deployment](DEPLOYMENT.md)
- [Project Structure](PROJECT-STRUCTURE.md)
- [Scripts Documentation](scripts/README.md)

## Model Training Options

This project supports multiple training approaches:

### 1. RAG (No Training Required) ✅
- Upload documents via the web interface
- Documents are used as context for responses
- **Best for:** Up-to-date information, quick setup

### 2. Local Fine-Tuning 🖥️
- Train Llama 3.1 8B on your own GPU
- Requires: NVIDIA GPU 16GB+ VRAM, Python, CUDA
- **Best for:** Full control, custom deployment
- **Guide:** [LOCAL-TRAINING-GUIDE.md](LOCAL-TRAINING-GUIDE.md)

### 3. Cloud Fine-Tuning ☁️
- Google Colab (free tier available)
- Hugging Face AutoTrain (~$5-50)
- **Best for:** No local GPU required
- **Guide:** [FINE-TUNING-GUIDE.md](FINE-TUNING-GUIDE.md)

## Troubleshooting

### API Key Issues
- Verify your `.env` file exists and contains your API key
- Check that `HUGGINGFACE_API_KEY` is set correctly
- Restart the server after changing environment variables

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

## License

ISC

## Support

For issues and questions, please check the documentation files or create an issue in the repository.

---

**Ready to deploy on Ubuntu?** Check out [DEPLOYMENT.md](DEPLOYMENT.md) 🚀