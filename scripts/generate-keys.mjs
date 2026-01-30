#!/usr/bin/env node

/**
 * Generate RSA key pair for SSF transmitter
 *
 * Run with: npm run generate-keys
 * or: node scripts/generate-keys.mjs
 */

import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { randomBytes } from 'crypto';

async function main() {
  console.log('Generating RSA 2048-bit key pair for SSF...\n');

  // Generate RSA key pair
  const { publicKey, privateKey } = await generateKeyPair('RS256', {
    modulusLength: 2048,
  });

  // Export keys in PEM format
  const privateKeyPem = await exportPKCS8(privateKey);
  const publicKeyPem = await exportSPKI(publicKey);

  // Generate a unique key ID
  const keyId = `ssf-key-${randomBytes(8).toString('hex')}`;

  console.log('='.repeat(60));
  console.log('Add these to your .env.local file or Vercel environment variables:');
  console.log('='.repeat(60));
  console.log();

  // Format for environment variables (escape newlines)
  const privateKeyEnv = privateKeyPem.replace(/\n/g, '\\n');
  const publicKeyEnv = publicKeyPem.replace(/\n/g, '\\n');

  console.log(`SSF_KEY_ID=${keyId}`);
  console.log();
  console.log(`SSF_PRIVATE_KEY="${privateKeyEnv}"`);
  console.log();
  console.log(`SSF_PUBLIC_KEY="${publicKeyEnv}"`);
  console.log();
  console.log('='.repeat(60));
  console.log();
  console.log('IMPORTANT: Keep your private key secret! Never commit it to git.');
  console.log();

  // Also output the PEM files for reference
  console.log('--- Private Key (PEM format) ---');
  console.log(privateKeyPem);
  console.log('--- Public Key (PEM format) ---');
  console.log(publicKeyPem);
}

main().catch(console.error);
