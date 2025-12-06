import crypto from 'crypto'
import { env } from '@/lib/env';

const algorithm = 'aes-256-cbc'
const IV_LENGTH = 16

const rawKey = env.ACCESS_TOKEN_ENCRYPTION_KEY || ''
const ENCRYPTION_KEY = Buffer.from(rawKey, 'utf8')

function assertKeyLength() {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ACCESS_TOKEN_ENCRYPTION_KEY must be 32 bytes long')
  }
}

export function encrypt(value: string): string {
  assertKeyLength()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(value: string): string {
  assertKeyLength()
  const [ivHex, encryptedHex] = value.split(':')
  if (!ivHex || !encryptedHex) {
    throw new Error('Malformed encrypted value')
  }
  const iv = Buffer.from(ivHex, 'hex')
  const encryptedText = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv)
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
  return decrypted.toString('utf8')
}
