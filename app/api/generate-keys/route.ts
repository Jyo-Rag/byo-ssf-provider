import { NextResponse } from 'next/server';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { GenerateKeysResponse } from '@/lib/types';

function updateEnvVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  const separator = content.endsWith('\n') ? '' : '\n';
  return `${content}${separator}${key}=${value}\n`;
}

export async function GET(): Promise<NextResponse<GenerateKeysResponse>> {
  const keyId = process.env.SSF_KEY_ID ?? null;
  const hasKeys = !!(keyId && process.env.SSF_PRIVATE_KEY && process.env.SSF_PUBLIC_KEY);
  return NextResponse.json({ success: true, message: '', hasKeys, keyId });
}

export async function POST(): Promise<NextResponse<GenerateKeysResponse>> {
  try {
    const { publicKey, privateKey } = await generateKeyPair('RS256', { modulusLength: 2048 });

    const privateKeyPem = await exportPKCS8(privateKey);
    const publicKeyPem = await exportSPKI(publicKey);
    const keyId = `ssf-key-${randomBytes(8).toString('hex')}`;

    const privateKeyEnv = privateKeyPem.replace(/\n/g, '\\n');
    const publicKeyEnv = publicKeyPem.replace(/\n/g, '\\n');

    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';
    try {
      envContent = readFileSync(envPath, 'utf-8');
    } catch {
      // File doesn't exist yet, start fresh
    }

    envContent = updateEnvVar(envContent, 'SSF_KEY_ID', keyId);
    envContent = updateEnvVar(envContent, 'SSF_PRIVATE_KEY', `"${privateKeyEnv}"`);
    envContent = updateEnvVar(envContent, 'SSF_PUBLIC_KEY', `"${publicKeyEnv}"`);

    writeFileSync(envPath, envContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Keys generated and saved to .env.local.',
      keyId,
      hasKeys: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to generate keys', error: errorMessage },
      { status: 500 }
    );
  }
}
