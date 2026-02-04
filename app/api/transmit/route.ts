import { NextRequest, NextResponse } from 'next/server';
import { createSecurityEventToken } from '@/lib/jwt';
import type { TransmitRequest, TransmitResponse, RiskLevel } from '@/lib/types';

// Validate risk level
function isValidRiskLevel(level: string): level is RiskLevel {
  return ['low', 'medium', 'high', 'critical'].includes(level);
}

// Validate Okta org URL format
function isValidOktaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('okta');
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<TransmitResponse>> {
  try {
    const body: TransmitRequest = await request.json();

    // Validate required fields
    if (!body.oktaOrgUrl || !body.event) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'oktaOrgUrl and event are required' },
        { status: 400 }
      );
    }

    // Validate Okta URL
    if (!isValidOktaUrl(body.oktaOrgUrl)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Okta URL', error: 'Must be a valid HTTPS Okta organization URL' },
        { status: 400 }
      );
    }

    // Validate event data
    const { event } = body;

    if (!event.userIdentifier || !event.userIdentifier.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid user identifier', error: 'User identifier is required' },
        { status: 400 }
      );
    }

    if (!isValidRiskLevel(event.currentLevel) || !isValidRiskLevel(event.previousLevel)) {
      return NextResponse.json(
        { success: false, message: 'Invalid risk level', error: 'Risk levels must be low, medium, high, or critical' },
        { status: 400 }
      );
    }

    if (event.currentLevel === event.previousLevel) {
      return NextResponse.json(
        { success: false, message: 'Invalid risk levels', error: 'Current and previous levels must be different' },
        { status: 400 }
      );
    }

    // Create the Security Event Token
    const { token, eventId, decodedPayload } = await createSecurityEventToken(event, body.oktaOrgUrl);

    // Send to Okta SSF endpoint
    const oktaEndpoint = `${body.oktaOrgUrl}/security/api/v1/security-events`;

    const response = await fetch(oktaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/secevent+jwt',
        'Accept': 'application/json',
      },
      body: token,
    });

    const responseText = await response.text();
    console.log('Okta SSF response:', response.status, responseText);

    if (!response.ok) {
      console.error('Okta SSF error:', response.status, responseText);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send event to Okta',
          error: `Okta returned ${response.status}: ${responseText}`,
          eventId,
          token,
          decodedPayload,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Security event sent successfully',
      eventId,
      token,
      decodedPayload,
      oktaResponse: responseText || '(empty response)',
      oktaStatus: response.status,
    });
  } catch (error) {
    console.error('Transmit error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, message: 'Internal server error', error: errorMessage },
      { status: 500 }
    );
  }
}
