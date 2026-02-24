'use client';

import { useState } from 'react';
import type { CreateProviderResponse } from '@/lib/types';
import InfoDrawer from '@/components/InfoDrawer';

interface ProviderPanelProps {
  oktaOrgUrl: string;
  apiKey: string;
  appUrl: string;
  providerId: string;
  onProviderCreated: (providerId: string) => void;
}

export default function ProviderPanel({
  oktaOrgUrl,
  apiKey,
  appUrl,
  providerId,
  onProviderCreated,
}: ProviderPanelProps) {
  const [providerName, setProviderName] = useState('BYO SSF Provider');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateProviderResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const isReady = oktaOrgUrl && apiKey && appUrl;

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/create-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oktaOrgUrl, apiKey, providerName, appUrl }),
      });

      const data: CreateProviderResponse = await response.json();
      setResult(data);

      if (data.success && data.providerId) {
        onProviderCreated(data.providerId);
        localStorage.setItem('ssfProviderId', data.providerId);
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create provider';
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClear = () => {
    onProviderCreated('');
    localStorage.removeItem('ssfProviderId');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-okta-border shadow-sm mb-6">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-okta-border">
          <div className="flex items-center gap-2">
            <svg style={{ width: '1.1rem', height: '1.1rem' }} className="text-okta-gray-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold text-okta-charcoal text-sm">Security Events Provider</span>
          </div>
          <div className="flex items-center gap-2">
            {providerId && (
              <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">
                Created
              </span>
            )}
            <button
              onClick={() => setShowInfo(true)}
              className="text-xs text-okta-blue hover:text-okta-blue-hover hover:underline transition-colors font-medium"
            >
              Learn more
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!isReady && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Configure your Okta tenant URL and API key first.
            </p>
          )}

          {providerId ? (
            <div className="space-y-3">
              {result?.alreadyExisted ? (
                <div className="p-3 bg-okta-blue-light border border-okta-blue/20 rounded-md">
                  <p className="text-sm font-semibold text-okta-blue-dark mb-1">Existing provider found in Okta</p>
                  <p className="text-xs text-okta-blue-dark/80 mb-2">
                    A provider with this issuer URL already exists. Using the existing registration.
                  </p>
                  <p className="text-xs text-okta-blue-dark font-mono break-all">ID: {providerId}</p>
                  {result.oktaResponse && (
                    <div className="mt-2 space-y-1 text-xs text-okta-blue-dark/80">
                      {typeof result.oktaResponse.name === 'string' && (
                        <p><span className="font-medium">Name:</span> {result.oktaResponse.name}</p>
                      )}
                      {typeof result.oktaResponse.status === 'string' && (
                        <p><span className="font-medium">Status:</span> {result.oktaResponse.status}</p>
                      )}
                      {typeof result.oktaResponse.settings === 'object' && result.oktaResponse.settings !== null && (
                        Object.entries(result.oktaResponse.settings as Record<string, string>).map(([k, v]) => (
                          <p key={k}><span className="font-medium">{k}:</span> <span className="font-mono break-all">{v}</span></p>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">Provider registered in Okta</p>
                  <p className="text-xs text-emerald-700 font-mono break-all">ID: {providerId}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 py-2 px-3 text-sm border border-okta-border rounded-md hover:bg-okta-bg transition-colors text-okta-charcoal font-medium"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !isReady}
                  className="flex-1 py-2 px-3 text-sm border border-okta-blue text-okta-blue rounded-md hover:bg-okta-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Re-create Provider
                </button>
                <button
                  onClick={handleClear}
                  className="py-2 px-3 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
              {showDetails && Boolean(result?.oktaResponse) && (
                <pre className="p-3 bg-gray-900 text-green-400 rounded-md text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(result!.oktaResponse as object, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-okta-charcoal mb-1.5">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="BYO SSF Provider"
                  disabled={!isReady}
                  className="w-full px-3 py-2 border border-okta-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-okta-blue focus:border-okta-blue disabled:bg-okta-bg disabled:text-okta-gray-mid transition-colors"
                />
              </div>

              <div className="p-3 bg-okta-bg rounded-md text-xs text-okta-gray-mid space-y-1 border border-okta-border">
                <p className="font-medium text-okta-charcoal">Will register with Okta using:</p>
                <p>
                  <span className="font-mono text-okta-gray-mid">Well-known URL:</span>{' '}
                  {appUrl ? `${appUrl}/.well-known/ssf-configuration` : '(app URL not available)'}
                </p>
                <p>Falls back to issuer + JWKS if needed.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-semibold text-red-800 mb-1">Error creating provider</p>
                  <p className="text-xs text-red-700">{error}</p>
                  {Boolean(result?.oktaResponse) && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                        Okta response details
                      </summary>
                      <pre className="mt-2 p-2 bg-red-900 text-red-200 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result!.oktaResponse, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={isCreating || !isReady || !providerName.trim()}
                className="w-full py-2.5 px-4 bg-okta-blue text-white font-semibold text-sm rounded-md hover:bg-okta-blue-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Provider...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Provider in Okta
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <InfoDrawer isOpen={showInfo} onClose={() => setShowInfo(false)} title="About Security Events Provider">
        <p>
          Register third-party providers in Okta. This enables Okta to receive security signals
          from provider apps using the SSF. The SSF helps create a network between your
          third-party security vendor apps, continuously sharing security information with Okta.
        </p>
        <p>
          To receive signals, you need to create a representation of your third-party risk
          provider as a <span className="font-medium text-okta-charcoal">Receiver</span> in Okta.
          This is created under{' '}
          <span className="font-medium text-okta-charcoal">
            Security → Device Integrations → Receive Shared Signals
          </span>.
        </p>
        <p className="text-xs">
          The screenshots below show the Okta Admin Console — first the{' '}
          <span className="font-medium">Receive Shared Signals</span> tab listing your streams,
          then the stream configuration dialog where you register this app as a receiver.
        </p>
        <div className="rounded-md overflow-hidden border border-okta-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/receive_shared_signals.png"
            alt="Okta Admin Console — Device Integrations: Receive Shared Signals tab"
            className="w-full h-auto"
          />
        </div>
        <div className="rounded-md overflow-hidden border border-okta-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/receiver_screenshot.png"
            alt="Okta Admin Console — Edit a stream to receive a signal dialog"
            className="w-full h-auto"
          />
        </div>
      </InfoDrawer>
    </>
  );
}
