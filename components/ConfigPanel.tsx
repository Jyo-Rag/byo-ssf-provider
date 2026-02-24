'use client';

import { useState, useEffect } from 'react';
import InfoDrawer from '@/components/InfoDrawer';

interface ConfigPanelProps {
  oktaOrgUrl: string;
  apiKey: string;
  publicAppUrl: string;
  onOktaOrgUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onPublicAppUrlChange: (url: string) => void;
}

export default function ConfigPanel({ oktaOrgUrl, apiKey, publicAppUrl, onOktaOrgUrlChange, onApiKeyChange, onPublicAppUrlChange }: ConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!oktaOrgUrl);
  const [localUrl, setLocalUrl] = useState(oktaOrgUrl);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localPublicAppUrl, setLocalPublicAppUrl] = useState(publicAppUrl);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setLocalUrl(oktaOrgUrl);
    setLocalApiKey(apiKey);
    setLocalPublicAppUrl(publicAppUrl);
    if (!oktaOrgUrl) {
      setIsExpanded(true);
    }
  }, [oktaOrgUrl, apiKey, publicAppUrl]);

  const handleSave = () => {
    const trimmedUrl = localUrl.trim().replace(/\/$/, '');
    const trimmedKey = localApiKey.trim();
    const trimmedPublicUrl = localPublicAppUrl.trim().replace(/\/$/, '');
    onOktaOrgUrlChange(trimmedUrl);
    onApiKeyChange(trimmedKey);
    onPublicAppUrlChange(trimmedPublicUrl);
    localStorage.setItem('oktaOrgUrl', trimmedUrl);
    localStorage.setItem('oktaApiKey', trimmedKey);
    localStorage.setItem('publicAppUrl', trimmedPublicUrl);
    setIsExpanded(false);
  };

  const isValidOktaUrl = () => {
    try {
      const url = new URL(localUrl);
      return url.protocol === 'https:' && localUrl.includes('okta');
    } catch {
      return false;
    }
  };

  const isValidPublicAppUrl = () => {
    if (!localPublicAppUrl.trim()) return false;
    try {
      const url = new URL(localPublicAppUrl);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const canSave = isValidOktaUrl() && localApiKey.trim().length > 0 && isValidPublicAppUrl();

  return (
    <>
      <div className="bg-white rounded-lg border border-okta-border shadow-sm mb-6">
        {/* Header: expand button on the left, badges + learn more on the right */}
        <div className="px-5 py-3.5 flex items-center border-b border-okta-border gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <svg
              className="text-okta-gray-mid flex-shrink-0"
              style={{ width: '1.1rem', height: '1.1rem' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-okta-charcoal text-sm">Configuration</span>
            {oktaOrgUrl && (
              <span className="text-sm text-okta-gray-mid truncate max-w-xs hidden sm:inline">
                ({oktaOrgUrl})
              </span>
            )}
            <svg
              className={`text-okta-gray-mid transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`}
              style={{ width: '1rem', height: '1rem' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Right-side items outside the expand button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {oktaOrgUrl && apiKey && (
              <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">
                Configured
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

        {isExpanded && (
          <div className="px-5 pb-5 border-t border-okta-border">
            <div className="mt-4 space-y-4">

              <div>
                <label htmlFor="oktaUrl" className="block text-sm font-medium text-okta-charcoal mb-1.5">
                  Okta Tenant URL
                </label>
                <input
                  type="url"
                  id="oktaUrl"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                  placeholder="https://your-org.okta.com"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-okta-blue focus:border-okta-blue transition-colors ${
                    localUrl && !isValidOktaUrl() ? 'border-red-300' : 'border-okta-border'
                  }`}
                />
                {localUrl && !isValidOktaUrl() && (
                  <p className="mt-1 text-xs text-red-600">
                    Please enter a valid Okta HTTPS URL (e.g., https://your-org.okta.com)
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-okta-charcoal mb-1.5">
                  Okta API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your Okta API token"
                    className="w-full px-3 py-2 pr-10 border border-okta-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-okta-blue focus:border-okta-blue transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-okta-gray-mid hover:text-okta-charcoal transition-colors"
                  >
                    {showApiKey ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-okta-gray-mid">
                  Generate an API token in Okta Admin Console under Security → API → Tokens.
                  Stored in your browser&apos;s local storage.
                </p>
              </div>

              <div>
                <label htmlFor="publicAppUrl" className="block text-sm font-medium text-okta-charcoal mb-1.5">
                  Public App HTTPS URL
                </label>
                <input
                  type="url"
                  id="publicAppUrl"
                  value={localPublicAppUrl}
                  onChange={(e) => setLocalPublicAppUrl(e.target.value)}
                  placeholder="https://abc123.ngrok.io"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-okta-blue focus:border-okta-blue transition-colors ${
                    localPublicAppUrl && !isValidPublicAppUrl() ? 'border-red-300' : 'border-okta-border'
                  }`}
                />
                {localPublicAppUrl && !isValidPublicAppUrl() && (
                  <p className="mt-1 text-xs text-red-600">
                    Must be a valid HTTPS URL
                  </p>
                )}
                <p className="mt-1 text-xs text-okta-gray-mid">
                  The public HTTPS URL where this app is reachable (e.g. ngrok tunnel, Vercel URL).
                  Okta uses this to verify JWTs — it must be HTTPS.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={!canSave}
                className="w-full py-2.5 px-4 bg-okta-blue text-white text-sm font-semibold rounded-md hover:bg-okta-blue-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      <InfoDrawer isOpen={showInfo} onClose={() => setShowInfo(false)} title="About Okta Connection">
        <p>
          This section connects the app to your Okta tenant so it can authenticate API calls and
          send security event tokens on your behalf.
        </p>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-okta-charcoal text-xs uppercase tracking-wide mb-1">Okta Tenant URL</p>
            <p className="text-xs">
              Your Okta organization&apos;s base URL, e.g.{' '}
              <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">https://your-org.okta.com</span>.
              Found in your Okta Admin Console address bar.
            </p>
          </div>
          <div>
            <p className="font-semibold text-okta-charcoal text-xs uppercase tracking-wide mb-1">API Key</p>
            <p className="text-xs">
              An Okta API token (SSWS token) used to authenticate requests to the Okta API —
              for example, to register this app as a security events provider. Generate one in
              your Okta Admin Console under{' '}
              <span className="font-medium text-okta-charcoal">Security → API → Tokens</span>.
            </p>
          </div>
          <div>
            <p className="font-semibold text-okta-charcoal text-xs uppercase tracking-wide mb-1">Public App HTTPS URL</p>
            <p className="text-xs">
              The publicly reachable HTTPS URL for this app. Okta fetches the JWKS endpoint at{' '}
              <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{'{url}'}/api/jwks</span> to
              verify the signature on every event token you send. Must be HTTPS — use an ngrok
              tunnel for local development, or a Vercel deployment URL for web hosting.
            </p>
          </div>
        </div>
      </InfoDrawer>
    </>
  );
}
