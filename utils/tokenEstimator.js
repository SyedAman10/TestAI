/**
 * Estimate token count for text
 * Rough estimation: 1 token ≈ 4 characters for English text
 * This is a conservative estimate for safety
 */
export function estimateTokens(text) {
  if (!text) return 0;
  // Conservative estimate: 1 token per 3.5 characters
  return Math.ceil(text.length / 3.5);
}

/**
 * Truncate text to fit within token limit
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Maximum tokens allowed
 * @returns {string} Truncated text
 */
export function truncateToTokenLimit(text, maxTokens) {
  const estimatedTokens = estimateTokens(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Calculate how many characters we can keep
  const maxChars = Math.floor(maxTokens * 3.5);
  return text.substring(0, maxChars) + '\n\n[Content truncated to fit token limit]';
}

/**
 * Check if text fits within model's context window
 * Llama 3.1 8B has 16,384 token context
 * We reserve space for: system prompt (~500), user message (~200), response (~1000)
 * So we limit context to ~14,000 tokens to be safe
 */
export const MODEL_CONTEXT_LIMIT = 16384;
export const SAFE_CONTEXT_LIMIT = 14000; // Leave room for prompts and response
export const SYSTEM_PROMPT_TOKENS = 500;
export const USER_MESSAGE_TOKENS = 200;
export const RESPONSE_TOKENS = 1000;

export function calculateAvailableContextTokens() {
  return SAFE_CONTEXT_LIMIT - SYSTEM_PROMPT_TOKENS - USER_MESSAGE_TOKENS - RESPONSE_TOKENS;
}

