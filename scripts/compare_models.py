#!/usr/bin/env python3
"""
Model Comparison Script
Compare responses between base Llama 3.1 8B and your fine-tuned version
"""

import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import json

BASE_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
FINE_TUNED_MODEL = "models/ketamine-therapy-fine-tuned"

print("=" * 70)
print("🔬 MODEL COMPARISON TOOL")
print("=" * 70)
print()
print("Compare responses between:")
print(f"  • Base Model: {BASE_MODEL}")
print(f"  • Fine-Tuned: {FINE_TUNED_MODEL}")
print()

def load_models():
    """Load both models for comparison"""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🔧 Using device: {device}")
    print()
    
    # Check if fine-tuned model exists
    if not os.path.exists(FINE_TUNED_MODEL):
        print(f"❌ Fine-tuned model not found at {FINE_TUNED_MODEL}")
        print("Please train the model first: python scripts/train.py")
        exit(1)
    
    print("📥 Loading base model...")
    base_tokenizer = AutoTokenizer.from_pretrained(
        BASE_MODEL,
        token=os.getenv('HUGGINGFACE_TOKEN')
    )
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else "cpu",
        token=os.getenv('HUGGINGFACE_TOKEN')
    )
    print("✅ Base model loaded")
    
    print("📥 Loading fine-tuned model...")
    ft_tokenizer = AutoTokenizer.from_pretrained(FINE_TUNED_MODEL)
    ft_model = AutoModelForCausalLM.from_pretrained(
        FINE_TUNED_MODEL,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else "cpu"
    )
    print("✅ Fine-tuned model loaded")
    print()
    
    return base_model, base_tokenizer, ft_model, ft_tokenizer, device

def generate_response(model, tokenizer, device, user_input, context=""):
    """Generate response from a model"""
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
    
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    if "<|start_header_id|>assistant<|end_header_id|>" in response:
        response = response.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
    
    return response

def compare_responses(base_model, base_tokenizer, ft_model, ft_tokenizer, device, user_input, context=""):
    """Compare responses from both models"""
    print("\n" + "=" * 70)
    print(f"👤 USER INPUT: {user_input}")
    if context:
        print(f"📋 CONTEXT: {context}")
    print("=" * 70)
    
    print("\n🤖 BASE MODEL RESPONSE:")
    print("-" * 70)
    base_response = generate_response(base_model, base_tokenizer, device, user_input, context)
    print(base_response)
    
    print("\n" + "-" * 70)
    print("\n✨ FINE-TUNED MODEL RESPONSE:")
    print("-" * 70)
    ft_response = generate_response(ft_model, ft_tokenizer, device, user_input, context)
    print(ft_response)
    
    print("\n" + "=" * 70)
    
    return base_response, ft_response

def run_test_suite(base_model, base_tokenizer, ft_model, ft_tokenizer, device):
    """Run a suite of test cases"""
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
        },
        {
            "input": "Are there any side effects I should be aware of?",
            "context": "Safety and side effects"
        }
    ]
    
    results = []
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n\n{'=' * 70}")
        print(f"TEST CASE {i}/{len(test_cases)}")
        print(f"{'=' * 70}")
        
        base_response, ft_response = compare_responses(
            base_model, base_tokenizer,
            ft_model, ft_tokenizer,
            device,
            test['input'],
            test.get('context', '')
        )
        
        results.append({
            'input': test['input'],
            'context': test.get('context', ''),
            'base_response': base_response,
            'fine_tuned_response': ft_response
        })
        
        input("\n⏸️  Press Enter to continue to next test case...")
    
    return results

def save_results(results):
    """Save comparison results to file"""
    output_file = "model_comparison_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {output_file}")

def main():
    """Main function"""
    try:
        # Load models
        base_model, base_tokenizer, ft_model, ft_tokenizer, device = load_models()
        
        print("Choose comparison mode:")
        print("1. Run test suite (predefined scenarios)")
        print("2. Interactive comparison")
        print("3. Both")
        
        choice = input("\nEnter choice (1-3): ").strip()
        print()
        
        results = []
        
        if choice in ['1', '3']:
            results = run_test_suite(base_model, base_tokenizer, ft_model, ft_tokenizer, device)
            
            if results:
                save_results(results)
        
        if choice in ['2', '3']:
            print("\n" + "=" * 70)
            print("💬 INTERACTIVE COMPARISON MODE")
            print("=" * 70)
            print("Type your questions to compare responses.")
            print("Type 'quit' or 'exit' to stop.")
            print("=" * 70)
            
            while True:
                try:
                    user_input = input("\n👤 Your question: ").strip()
                    
                    if not user_input:
                        continue
                    
                    if user_input.lower() in ['quit', 'exit', 'q']:
                        break
                    
                    context = input("📋 Context (optional, press Enter to skip): ").strip()
                    
                    compare_responses(
                        base_model, base_tokenizer,
                        ft_model, ft_tokenizer,
                        device,
                        user_input,
                        context
                    )
                    
                except KeyboardInterrupt:
                    print("\n\n👋 Exiting...")
                    break
        
        print("\n" + "=" * 70)
        print("✅ COMPARISON COMPLETE")
        print("=" * 70)
        print("\n📊 Analysis Tips:")
        print("  • Does the fine-tuned model show better therapeutic style?")
        print("  • Is the information more accurate/relevant?")
        print("  • Does it better match your training examples?")
        print("  • If not satisfied, add more training examples and retrain!")
        print()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

