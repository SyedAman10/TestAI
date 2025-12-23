#!/usr/bin/env python3
"""
Test Inference Script for Fine-Tuned Model
Tests the locally trained Ketamine Therapy Companion model
"""

import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

MODEL_PATH = "models/ketamine-therapy-fine-tuned"

print("=" * 70)
print("🧠 TESTING FINE-TUNED MODEL")
print("=" * 70)
print()

def load_model():
    """Load the fine-tuned model"""
    print(f"📥 Loading model from {MODEL_PATH}...")
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found at {MODEL_PATH}")
        print("\nPlease train the model first using: python scripts/train.py")
        exit(1)
    
    # Check for GPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🔧 Using device: {device}")
    
    if device == "cpu":
        print("⚠️  WARNING: Running on CPU. Inference will be slow.")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else "cpu"
    )
    
    print("✅ Model loaded successfully!\n")
    
    return model, tokenizer, device

def generate_response(model, tokenizer, device, user_input, context=""):
    """Generate a response from the model"""
    
    # Format prompt
    if context:
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a compassionate and knowledgeable Ketamine Therapy Companion AI assistant.
Context: {context}<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""
    else:
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a compassionate and knowledgeable Ketamine Therapy Companion AI assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>

{user_input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""
    
    # Tokenize
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    
    # Generate
    print("🤖 Generating response...\n")
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # Decode
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract just the assistant's response
    if "<|start_header_id|>assistant<|end_header_id|>" in response:
        response = response.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
    
    return response

def interactive_mode(model, tokenizer, device):
    """Interactive chat mode"""
    print("=" * 70)
    print("💬 INTERACTIVE MODE")
    print("=" * 70)
    print("Type your questions and get responses from the fine-tuned model.")
    print("Commands:")
    print("  - 'quit' or 'exit': Exit")
    print("  - 'test': Run test scenarios")
    print("  - 'clear': Clear screen")
    print("=" * 70)
    print()
    
    while True:
        try:
            user_input = input("👤 You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break
            
            if user_input.lower() == 'clear':
                os.system('cls' if os.name == 'nt' else 'clear')
                continue
            
            if user_input.lower() == 'test':
                run_test_scenarios(model, tokenizer, device)
                continue
            
            response = generate_response(model, tokenizer, device, user_input)
            print(f"\n🤖 Assistant: {response}\n")
            print("-" * 70)
            print()
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}\n")

def run_test_scenarios(model, tokenizer, device):
    """Run predefined test scenarios"""
    print("\n" + "=" * 70)
    print("🧪 RUNNING TEST SCENARIOS")
    print("=" * 70)
    print()
    
    test_cases = [
        {
            "input": "I'm feeling anxious about my first ketamine therapy session. What should I expect?",
            "context": "Pre-session preparation"
        },
        {
            "input": "What is ketamine therapy used for?",
            "context": "General information"
        },
        {
            "input": "How many sessions will I need?",
            "context": "Treatment planning"
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}/{len(test_cases)}")
        print("-" * 70)
        print(f"👤 Input: {test['input']}")
        if test.get('context'):
            print(f"📋 Context: {test['context']}")
        print()
        
        response = generate_response(
            model, tokenizer, device,
            test['input'],
            test.get('context', '')
        )
        
        print(f"🤖 Response: {response}")
        print("-" * 70)
    
    print("\n✅ Test scenarios complete!\n")

def main():
    """Main function"""
    try:
        # Load model
        model, tokenizer, device = load_model()
        
        print("Choose mode:")
        print("1. Interactive chat")
        print("2. Run test scenarios")
        print("3. Both")
        
        choice = input("\nEnter choice (1-3): ").strip()
        print()
        
        if choice == '1':
            interactive_mode(model, tokenizer, device)
        elif choice == '2':
            run_test_scenarios(model, tokenizer, device)
        elif choice == '3':
            run_test_scenarios(model, tokenizer, device)
            interactive_mode(model, tokenizer, device)
        else:
            print("Invalid choice. Running interactive mode...")
            interactive_mode(model, tokenizer, device)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

