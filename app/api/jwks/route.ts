import { NextResponse } from 'next/server';
import { getJWKS } from '@/lib/keys';

export async function GET() {
  try {
    const jwks = await getJWKS();

    return NextResponse.json(jwks, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating JWKS:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to generate JWKS. Check server configuration.',
        details: errorMessage,
        hasPublicKey: !!process.env.SSF_PUBLIC_KEY,
        hasKeyId: !!process.env.SSF_KEY_ID,
      },
      { status: 500 }
    );
  }
}
