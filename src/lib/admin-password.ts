import crypto from "crypto";

const SCRYPT_KEYLEN = 64;

function toHex(buffer: Buffer): string {
  return buffer.toString("hex");
}

function fromHex(value: string): Buffer {
  return Buffer.from(value, "hex");
}

export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${toHex(salt)}:${toHex(hash)}`;
}

export function verifyAdminPassword(password: string, passwordHash: string): boolean {
  const [saltHex, hashHex] = passwordHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = fromHex(saltHex);
  const storedHash = fromHex(hashHex);
  const inputHash = crypto.scryptSync(password, salt, storedHash.length);

  if (inputHash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(inputHash, storedHash);
}
