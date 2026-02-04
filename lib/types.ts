// Risk levels as defined in CAEP specification
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Subject identifier formats
export type SubjectFormat = 'email' | 'opaque';

// Subject identifier
export interface SubjectIdentifier {
  format: SubjectFormat;
  email?: string;
  id?: string;
}

// Okta User Risk Change event payload
export interface UserRiskChangeEvent {
  subject: {
    user: SubjectIdentifier;
  };
  current_level: RiskLevel;
  previous_level: RiskLevel;
  change_direction: 'increase' | 'decrease';
  event_timestamp: number;
  reason_admin?: {
    en: string;
  };
}

// Security Event Token (SET) structure
export interface SecurityEventToken {
  iss: string;
  aud: string;
  iat: number;
  jti: string;
  events: {
    [eventType: string]: UserRiskChangeEvent;
  };
}

// Form data for creating a risk event
export interface RiskEventFormData {
  userIdentifier: string;
  identifierType: SubjectFormat;
  currentLevel: RiskLevel;
  previousLevel: RiskLevel;
  reason: string;
}

// API request payload
export interface TransmitRequest {
  oktaOrgUrl: string;
  event: RiskEventFormData;
}

// API response
export interface TransmitResponse {
  success: boolean;
  message: string;
  eventId?: string;
  error?: string;
  token?: string;
  decodedPayload?: SecurityEventToken;
  oktaResponse?: string;
  oktaStatus?: number;
}

// Event history item
export interface EventHistoryItem {
  id: string;
  timestamp: Date;
  userIdentifier: string;
  currentLevel: RiskLevel;
  previousLevel: RiskLevel;
  success: boolean;
  error?: string;
  token?: string;
  decodedPayload?: SecurityEventToken;
  oktaResponse?: string;
  oktaStatus?: number;
}

// JWKS structure
export interface JWKS {
  keys: JWK[];
}

export interface JWK {
  kty: string;
  use: string;
  kid: string;
  alg: string;
  n: string;
  e: string;
}

// SSF Configuration
export interface SSFConfiguration {
  issuer: string;
  jwks_uri: string;
  delivery_methods_supported: string[];
  critical_subject_members: string[];
}
