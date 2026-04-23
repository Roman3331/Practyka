import { createHash } from "crypto";

/**
 * Hashes a string using SHA256.
 * @param data The string to hash.
 * @returns The hex string of the hash.
 */
export function hashSHA256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Verifies a string against a SHA256 hash.
 * @param data The plain string.
 * @param hash The hash to compare against.
 * @returns True if the string matches the hash.
 */
export function verifySHA256(data: string, hash: string): boolean {
  return hashSHA256(data) === hash;
}
