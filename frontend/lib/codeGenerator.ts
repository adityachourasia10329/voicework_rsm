/**
 * 5-Character Alphanumeric Identifier System (Base36)
 * Generates compact, collision-proof uppercase codes (e.g., '7K9Q2', 'B4T81')
 * with 60M+ unique combinations, database constraint checking, and retry loop.
 */

export const BASE36_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const CODE_LENGTH = 5;
export const MAX_RETRIES = 100;

const CODE_REGEX = /^[0-9A-Z]{5}$/;

/**
 * Validates if the string is a valid 5-character uppercase Base36 code.
 */
export function isValid5CharCode(code: string): boolean {
  if (!code || code.length !== CODE_LENGTH) return false;
  return CODE_REGEX.test(code.toUpperCase());
}

/**
 * Generates a random 5-character uppercase alphanumeric code using Base36.
 */
export function generate5CharCode(): string {
  let result = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(CODE_LENGTH);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < CODE_LENGTH; i++) {
      result += BASE36_ALPHABET[bytes[i] % BASE36_ALPHABET.length];
    }
  } else {
    // Fallback for Node.js / non-browser environments
    for (let i = 0; i < CODE_LENGTH; i++) {
      result += BASE36_ALPHABET[Math.floor(Math.random() * BASE36_ALPHABET.length)];
    }
  }
  return result;
}

/**
 * Collision-proof retry loop with constraint checking.
 * Guarantees zero collisions by checking against the store / database.
 */
export async function generateUniqueCode(
  isCodeTaken: (code: string) => boolean | Promise<boolean>,
  maxRetries = MAX_RETRIES
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidate = generate5CharCode();
    const taken = await isCodeTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }
  throw new Error(`Failed to generate unique 5-character code after ${maxRetries} attempts.`);
}
