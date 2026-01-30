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

    return NextResponse.json(
      { error: 'Failed to generate JWKS. Check server configuration.' },
      { status: 500 }
    );
  }
}
