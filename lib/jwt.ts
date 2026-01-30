import { SignJWT } from 'jose';
import { getPrivateKey, getKeyId } from './keys';
import type { RiskEventFormData, SecurityEventToken, SubjectIdentifier } from './types';

const CAEP_ASSURANCE_LEVEL_CHANGE = 'https://schemas.openid.net/secevent/caep/event-type/assurance-level-change';

// Determine change direction based on risk levels
function getChangeDirection(previous: string, current: string): 'increase' | 'decrease' {
  const levelOrder = ['low', 'medium', 'high', 'critical'];
  const previousIndex = levelOrder.indexOf(previous);
  const currentIndex = levelOrder.indexOf(current);

  return currentIndex > previousIndex ? 'increase' : 'decrease';
}

// Generate a unique event ID
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Build the subject identifier based on format
function buildSubject(identifier: string, format: 'email' | 'opaque'): SubjectIdentifier {
  if (format === 'email') {
    return {
      format: 'email',
      email: identifier,
    };
  }

  return {
    format: 'opaque',
    id: identifier,
  };
}

// Get the issuer URL (the app's URL)
export function getIssuer(): string {
  // Prefer explicit APP_URL if set (for production domain)
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fall back to VERCEL_URL (deployment-specific URL)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

// Create and sign a Security Event Token (SET)
export async function createSecurityEventToken(
  eventData: RiskEventFormData,
  audience: string
): Promise<{ token: string; eventId: string }> {
  const privateKey = await getPrivateKey();
  const keyId = getKeyId();
  const issuer = getIssuer();
  const eventId = generateEventId();
  const now = Math.floor(Date.now() / 1000);

  const subject = buildSubject(eventData.userIdentifier, eventData.identifierType);
  const changeDirection = getChangeDirection(eventData.previousLevel, eventData.currentLevel);

  // Build the SET payload
  const payload: Omit<SecurityEventToken, 'iss' | 'aud' | 'iat' | 'jti'> = {
    events: {
      [CAEP_ASSURANCE_LEVEL_CHANGE]: {
        subject,
        current_level: eventData.currentLevel,
        previous_level: eventData.previousLevel,
        change_direction: changeDirection,
        event_timestamp: now,
        ...(eventData.reason && {
          reason_admin: {
            en: eventData.reason,
          },
        }),
      },
    },
  };

  // Sign the JWT
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'RS256', kid: keyId, typ: 'secevent+jwt' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt(now)
    .setJti(eventId)
    .sign(privateKey);

  return { token, eventId };
}
