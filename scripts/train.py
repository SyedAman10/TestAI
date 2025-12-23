#!/usr/bin/env python3
"""
Local Fine-Tuning Script for Meta Llama 3.1 8B Instruct
Using QLoRA for efficient training on consumer GPUs (16GB+ recommended)
"""

import os
import json
import torch
from datetime import datetime
from pathlib import Path

print("=" * 70)
print("🧠 KETAMINE THERAPY COMPANION - LOCAL TRAINING")
print("=" * 70)
print()

# Check for required packages
try:
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        TrainingArguments,
        Trainer,
        DataCollatorForLanguageModeling
    )
    from datasets import Dataset
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from transformers import BitsAndBytesConfig
    print("✅ All required packages imported successfully")
except ImportError as e:
    print("❌ Missing required packages!")
    print("\nPlease install the required packages:")
    print("pip install transformers datasets accelerate bitsandbytes peft torch")
    print("\nFor GPU support, ensure you have CUDA installed.")
    print(f"\nError: {e}")
    exit(1)

# Configuration
MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"
TRAINING_DATA_FILE = "fine-tuning/training-data/user-examples.json"
OUTPUT_DIR = "models/ketamine-therapy-fine-tuned"
CHECKPOINT_DIR = "models/checkpoints"

# Training hyperparameters
LEARNING_RATE = 2e-4
BATCH_SIZE = 4
GRADIENT_ACCUMULATION_STEPS = 4
NUM_EPOCHS = 3
MAX_SEQ_LENGTH = 512
WARMUP_STEPS = 100

# LoRA parameters (for efficient fine-tuning)
LORA_R = 16
LORA_ALPHA = 32
LORA_DROPOUT = 0.05

def check_gpu():
    """Check GPU availability and specs"""
    print("\n🔍 Checking GPU availability...")
    
    if not torch.cuda.is_available():
        print("⚠️  WARNING: No GPU detected! Training will be VERY slow on CPU.")
        print("For optimal performance, use a machine with NVIDIA GPU (16GB+ VRAM)")
        response = input("\nContinue anyway? (yes/no): ")
        if response.lower() != 'yes':
            print("Training cancelled.")
            exit(0)
        return False
    
    gpu_name = torch.cuda.get_device_name(0)
    gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
    
    print(f"✅ GPU Found: {gpu_name}")
    print(f"✅ GPU Memory: {gpu_memory:.2f} GB")
    
    if gpu_memory < 12:
        print("⚠️  WARNING: GPU has less than 12GB memory. Training may fail.")
        print("Consider using Google Colab or reducing batch size.")
    
    return True

def load_training_data():
    """Load training data from JSON file"""
    print(f"\n📚 Loading training data from {TRAINING_DATA_FILE}...")
    
    if not os.path.exists(TRAINING_DATA_FILE):
        print(f"❌ Training data file not found: {TRAINING_DATA_FILE}")
        print("\nPlease create training examples using the Training Center web interface")
        print("or run: node fine-tuning/prepare-training-data.js")
        exit(1)
    
    with open(TRAINING_DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if len(data) == 0:
        print("❌ No training examples found!")
        print("Please add training examples using the web interface at:")
        print("http://localhost:3000/training.html")
        exit(1)
    
    print(f"✅ Loaded {len(data)} training examples")
    
    # Check for quality
    avg_response_length = sum(len(ex['response']) for ex in data) / len(data)
    print(f"📊 Average response length: {avg_response_length:.0f} characters")
    
    if len(data) < 50:
        print(f"⚠️  WARNING: Only {len(data)} examples. Recommend at least 100 for good results.")
    
    return data

def format_training_data(examples):
    """Format training examples into instruction format"""
    print("\n🔧 Formatting training data...")
    
    formatted_data = []
    
    for ex in examples:
        # Create instruction-following format
        instruction = ex.get('instruction', '')
        context = ex.get('context', '')
        response = ex.get('response', '')
        
        # Build prompt in chat format
        if context:
            prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a compassionate and knowledgeable Ketamine Therapy Companion AI assistant.
Context: {context}<|eot_id|><|start_header_id|>user<|end_header_id|>

{instruction}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{response}<|eot_id|>"""
        else:
            prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a compassionate and knowledgeable Ketamine Therapy Companion AI assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>

{instruction}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{response}<|eot_id|>"""
        
        formatted_data.append({'text': prompt})
    
    print(f"✅ Formatted {len(formatted_data)} examples")
    return formatted_data

def setup_model_and_tokenizer(use_gpu):
    """Setup model with QLoRA for efficient training"""
    print(f"\n🤖 Loading model: {MODEL_NAME}")
    print("This may take several minutes on first run (downloading ~16GB)...")
    
    # Configure quantization for memory efficiency
    if use_gpu:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16
        )
        
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
            token=os.getenv('HUGGINGFACE_TOKEN')  # Required for Llama access
        )
    else:
        # CPU mode (very slow, not recommended)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            device_map="cpu",
            trust_remote_code=True,
            token=os.getenv('HUGGINGFACE_TOKEN')
        )
    
    print("✅ Model loaded")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        trust_remote_code=True,
        token=os.getenv('HUGGINGFACE_TOKEN')
    )
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    
    print("✅ Tokenizer loaded")
    
    # Prepare model for training
    if use_gpu:
        model = prepare_model_for_kbit_training(model)
    
    # Configure LoRA
    lora_config = LoraConfig(
        r=LORA_R,
        lora_alpha=LORA_ALPHA,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=LORA_DROPOUT,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    return model, tokenizer

def tokenize_dataset(examples, tokenizer):
    """Tokenize the training dataset"""
    print("\n🔤 Tokenizing dataset...")
    
    def tokenize_function(example):
        return tokenizer(
            example['text'],
            truncation=True,
            max_length=MAX_SEQ_LENGTH,
            padding='max_length'
        )
    
    dataset = Dataset.from_list(examples)
    tokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=['text'])
    
    print(f"✅ Dataset tokenized: {len(tokenized_dataset)} examples")
    return tokenized_dataset

def train_model(model, tokenizer, train_dataset):
    """Train the model using Hugging Face Trainer"""
    print("\n🚀 Starting training...")
    print(f"⚙️  Configuration:")
    print(f"   - Learning Rate: {LEARNING_RATE}")
    print(f"   - Batch Size: {BATCH_SIZE}")
    print(f"   - Epochs: {NUM_EPOCHS}")
    print(f"   - Gradient Accumulation Steps: {GRADIENT_ACCUMULATION_STEPS}")
    print(f"   - Max Sequence Length: {MAX_SEQ_LENGTH}")
    print()
    
    # Create output directories
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=CHECKPOINT_DIR,
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
        learning_rate=LEARNING_RATE,
        fp16=torch.cuda.is_available(),
        logging_steps=10,
        save_strategy="epoch",
        save_total_limit=3,
        warmup_steps=WARMUP_STEPS,
        optim="paged_adamw_8bit" if torch.cuda.is_available() else "adamw_torch",
        report_to="none"  # Disable wandb/tensorboard
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        data_collator=data_collator
    )
    
    # Train!
    print("🔥 Training started...")
    print("=" * 70)
    
    start_time = datetime.now()
    trainer.train()
    end_time = datetime.now()
    
    print("=" * 70)
    print(f"✅ Training completed in {end_time - start_time}")
    
    return trainer

def save_model(model, tokenizer):
    """Save the fine-tuned model"""
    print(f"\n💾 Saving model to {OUTPUT_DIR}...")
    
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    print("✅ Model saved successfully!")
    print()
    print("📝 To use your fine-tuned model:")
    print("1. Update server.js to load from local path instead of Hugging Face API")
    print("2. Or push to Hugging Face Hub and use your model ID")
    print()
    print(f"Model location: {os.path.abspath(OUTPUT_DIR)}")

def main():
    """Main training pipeline"""
    try:
        # Check environment
        if not os.getenv('HUGGINGFACE_TOKEN'):
            print("⚠️  WARNING: HUGGINGFACE_TOKEN not set in environment")
            print("You may need Hugging Face access token for Llama 3.1")
            print("Get it from: https://huggingface.co/settings/tokens")
            print()
        
        # Check GPU
        use_gpu = check_gpu()
        
        # Load training data
        raw_data = load_training_data()
        formatted_data = format_training_data(raw_data)
        
        # Setup model
        model, tokenizer = setup_model_and_tokenizer(use_gpu)
        
        # Prepare dataset
        train_dataset = tokenize_dataset(formatted_data, tokenizer)
        
        # Train
        trainer = train_model(model, tokenizer, train_dataset)
        
        # Save
        save_model(model, tokenizer)
        
        print("\n" + "=" * 70)
        print("🎉 TRAINING COMPLETE!")
        print("=" * 70)
        print("\n✨ Your Ketamine Therapy Companion model is now fine-tuned!")
        print("\nNext steps:")
        print("1. Test the model with inference")
        print("2. Update your Node.js server to use the fine-tuned model")
        print("3. Consider uploading to Hugging Face Hub for easy deployment")
        print()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        print("Partial checkpoints may be saved in:", CHECKPOINT_DIR)
    except Exception as e:
        print(f"\n\n❌ Training failed with error:")
        print(f"{type(e).__name__}: {e}")
        print("\nTroubleshooting:")
        print("- Ensure you have enough GPU memory (16GB+ recommended)")
        print("- Verify Hugging Face token is set correctly")
        print("- Check training data format")
        print("- Try reducing BATCH_SIZE in this script")
        raise

if __name__ == "__main__":
    main()

