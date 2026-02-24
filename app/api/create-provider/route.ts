import { NextRequest, NextResponse } from 'next/server';
import type { CreateProviderRequest, CreateProviderResponse } from '@/lib/types';

function isValidOktaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('okta');
  } catch {
    return false;
  }
}

function isIssuerExistsError(json: Record<string, unknown>): boolean {
  const causes = json.errorCauses as Array<{ errorSummary: string }> | undefined;
  return Array.isArray(causes) && causes.some(
    (c) => typeof c.errorSummary === 'string' && c.errorSummary.includes('already exists')
  );
}

async function findExistingProvider(
  endpoint: string,
  apiKey: string,
  appUrl: string
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `SSWS ${apiKey}`, 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const providers = await res.json() as Record<string, unknown>[];
    return providers.find((p) => {
      const settings = p.settings as Record<string, unknown> | undefined;
      return (
        settings?.issuer === appUrl ||
        settings?.well_known_url === `${appUrl}/.well-known/ssf-configuration`
      );
    }) ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateProviderResponse>> {
  try {
    const body: CreateProviderRequest = await request.json();
    const { oktaOrgUrl, apiKey, providerName, appUrl } = body;

    if (!oktaOrgUrl || !apiKey || !appUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'oktaOrgUrl, apiKey, and appUrl are required' },
        { status: 400 }
      );
    }

    if (!isValidOktaUrl(oktaOrgUrl)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Okta URL', error: 'Must be a valid HTTPS Okta organization URL' },
        { status: 400 }
      );
    }

    const name = (providerName || 'BYO SSF Provider').trim();
    const wellKnownUrl = `${appUrl}/.well-known/ssf-configuration`;

    // First attempt: well-known URL approach (SSF-compliant provider)
    const providerPayload = {
      name,
      type: 'okta',
      settings: {
        well_known_url: wellKnownUrl,
      },
    };

    const endpoint = `${oktaOrgUrl}/api/v1/security-events-providers`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `SSWS ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(providerPayload),
    });

    const responseText = await response.text();
    let responseJson: Record<string, unknown>;
    try {
      responseJson = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      responseJson = { raw: responseText };
    }

    console.log('Okta create-provider response:', response.status, responseText);

    if (!response.ok) {
      // If well-known URL approach failed, try issuer/JWKS approach
      if (response.status === 400 || response.status === 422 || response.status === 500) {
        const fallbackPayload = {
          name,
          type: 'okta',
          settings: {
            issuer: appUrl,
            jwks_url: `${appUrl}/api/jwks`,
          },
        };

        const fallbackResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `SSWS ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(fallbackPayload),
        });

        const fallbackText = await fallbackResponse.text();
        let fallbackJson: Record<string, unknown>;
        try {
          fallbackJson = JSON.parse(fallbackText) as Record<string, unknown>;
        } catch {
          fallbackJson = { raw: fallbackText };
        }

        console.log('Okta create-provider fallback response:', fallbackResponse.status, fallbackText);

        if (!fallbackResponse.ok) {
          // If issuer already exists, look up and return the existing provider
          if (isIssuerExistsError(fallbackJson)) {
            const existing = await findExistingProvider(endpoint, apiKey, appUrl);
            if (existing) {
              console.log('Found existing provider:', existing.id);
              return NextResponse.json({
                success: true,
                message: 'A provider with this issuer already exists in Okta.',
                providerId: typeof existing.id === 'string' ? existing.id : undefined,
                providerStatus: typeof existing.status === 'string' ? existing.status : undefined,
                oktaResponse: existing,
                alreadyExisted: true,
              });
            }
          }

          return NextResponse.json(
            {
              success: false,
              message: 'Failed to create security events provider',
              error: `Okta returned ${fallbackResponse.status}: ${fallbackText}`,
              oktaResponse: fallbackJson,
            },
            { status: 502 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Security events provider created (issuer/JWKS method)',
          providerId: typeof fallbackJson.id === 'string' ? fallbackJson.id : undefined,
          providerStatus: typeof fallbackJson.status === 'string' ? fallbackJson.status : undefined,
          oktaResponse: fallbackJson,
        });
      }

      // If issuer already exists at primary level too, look up the existing provider
      if (isIssuerExistsError(responseJson)) {
        const existing = await findExistingProvider(endpoint, apiKey, appUrl);
        if (existing) {
          console.log('Found existing provider:', existing.id);
          return NextResponse.json({
            success: true,
            message: 'A provider with this issuer already exists in Okta.',
            providerId: typeof existing.id === 'string' ? existing.id : undefined,
            providerStatus: typeof existing.status === 'string' ? existing.status : undefined,
            oktaResponse: existing,
            alreadyExisted: true,
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create security events provider',
          error: `Okta returned ${response.status}: ${responseText}`,
          oktaResponse: responseJson,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Security events provider created (well-known URL method)',
      providerId: typeof responseJson.id === 'string' ? responseJson.id : undefined,
      providerStatus: typeof responseJson.status === 'string' ? responseJson.status : undefined,
      oktaResponse: responseJson,
    });
  } catch (error) {
    console.error('Create provider error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: errorMessage },
      { status: 500 }
    );
  }
}
