/**
 * Hash Utility Library
 * 
 * Uses Web Crypto SHA-256 to generate deterministic hashes from string identifiers.
 * The hash is truncated to fit within the Compact Field type (253-bit BN254 field).
 */

/**
 * Generate a SHA-256 hash of an identifier, truncated to a Field-compatible bigint.
 * 
 * @param identifier - The unique identifier (email, username, etc.)
 * @returns The hash as a bigint Field element
 */
export async function hashIdentifier(identifier: string): Promise<bigint> {
  // Normalize the identifier (trim whitespace, lowercase)
  const normalized = identifier.trim().toLowerCase();

  if (!normalized) {
    throw new Error('Identifier cannot be empty');
  }

  // Encode as UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // SHA-256 hash via Web Crypto
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashBytes = new Uint8Array(hashBuffer);

  // Convert to bigint (big-endian)
  let hashBigint = 0n;
  for (const byte of hashBytes) {
    hashBigint = (hashBigint << 8n) | BigInt(byte);
  }

  // Truncate to fit within the BN254 scalar field (253 bits)
  // The BN254 field modulus is approximately 2^253, so we mask to 252 bits to be safe
  const FIELD_MASK = (1n << 252n) - 1n;
  return hashBigint & FIELD_MASK;
}

/**
 * Format a hash for display (truncated hex representation)
 * 
 * @param hash - The hash as bigint
 * @returns Formatted string like "0x3f4a2b1c..."
 */
export function formatHash(hash: bigint): string {
  const hexHash = hash.toString(16);
  if (hexHash.length > 16) {
    return `0x${hexHash.substring(0, 8)}...${hexHash.substring(hexHash.length - 8)}`;
  }
  return `0x${hexHash}`;
}

/**
 * Validate an identifier format
 * 
 * @param identifier - The identifier to validate
 * @returns true if valid, false otherwise
 */
export function isValidIdentifier(identifier: string): boolean {
  const normalized = identifier.trim();

  // Must not be empty
  if (!normalized) return false;

  // Must be at least 3 characters
  if (normalized.length < 3) return false;

  // Can contain letters, numbers, @, ., -, _
  const validPattern = /^[a-zA-Z0-9@.\-_]+$/;
  return validPattern.test(normalized);
}
