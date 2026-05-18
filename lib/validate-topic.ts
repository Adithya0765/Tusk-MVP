import { DEBATE_LIMITS } from '@/types/index'

/**
 * Strip HTML tags and dangerous characters to mitigate prompt injection.
 * Used before sending topic text to AI providers.
 */
export function sanitizeTopic(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')         // strip HTML tags
    .replace(/[<>]/g, '')            // strip stray angle brackets
    .replace(/\0/g, '')              // strip null bytes
    .trim()
}

/**
 * Returns true if the topic string is valid (non-empty after trim, within length limit).
 * Used on the client side (form validation).
 */
export function validateTopicClient(s: string): boolean {
  return s.trim().length > 0 && s.length <= DEBATE_LIMITS.MAX_TOPIC_LENGTH
}

/**
 * Returns true if the topic string is valid (non-empty after sanitization, within length limit).
 * Used on the server side (API route validation).
 */
export function validateTopicServer(s: string): boolean {
  const cleaned = sanitizeTopic(s)
  return cleaned.length > 0 && cleaned.length <= DEBATE_LIMITS.MAX_TOPIC_LENGTH
}
