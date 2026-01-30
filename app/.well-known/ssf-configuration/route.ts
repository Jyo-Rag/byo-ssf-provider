import { NextResponse } from 'next/server';
import { getIssuer } from '@/lib/jwt';
import type { SSFConfiguration } from '@/lib/types';

export async function GET() {
  const issuer = getIssuer();

  const configuration: SSFConfiguration = {
    issuer,
    jwks_uri: `${issuer}/api/jwks`,
    delivery_methods_supported: [
      'https://schemas.openid.net/secevent/risc/delivery-method/push',
    ],
    critical_subject_members: ['email'],
  };

  return NextResponse.json(configuration, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}
