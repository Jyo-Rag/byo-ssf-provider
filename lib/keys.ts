import { importPKCS8, exportJWK } from 'jose';
import type { JWKS, JWK } from './types';

// Get the private key from environment variable
export async function getPrivateKey() {
  const privateKeyPem = process.env.SSF_PRIVATE_KEY;

  if (!privateKeyPem) {
    throw new Error('SSF_PRIVATE_KEY environment variable is not set');
  }

  // Handle escaped newlines from environment variables
  const formattedKey = privateKeyPem.replace(/\\n/g, '\n');

  return await importPKCS8(formattedKey, 'RS256');
}

// Get the key ID from environment variable
export function getKeyId(): string {
  const keyId = process.env.SSF_KEY_ID;

  if (!keyId) {
    throw new Error('SSF_KEY_ID environment variable is not set');
  }

  return keyId;
}

// Generate JWKS from the public key environment variable
export async function getJWKS(): Promise<JWKS> {
  const publicKeyPem = process.env.SSF_PUBLIC_KEY;

  if (!publicKeyPem) {
    throw new Error('SSF_PUBLIC_KEY environment variable is not set');
  }

  // Handle both escaped newlines (\n as literal string) and actual newlines
  let formattedKey = publicKeyPem.replace(/\\n/g, '\n');

  // Also handle case where quotes were included
  formattedKey = formattedKey.replace(/^["']|["']$/g, '');

  // Import the public key using the crypto module
  const { createPublicKey } = await import('crypto');
  const publicKey = createPublicKey(formattedKey);

  // Export to JWK format using jose
  const jwk = await exportJWK(publicKey);

  const keyId = getKeyId();

  const publicJwk: JWK = {
    kty: jwk.kty as string,
    use: 'sig',
    kid: keyId,
    alg: 'RS256',
    n: jwk.n as string,
    e: jwk.e as string,
  };

  return {
    keys: [publicJwk],
  };
}
