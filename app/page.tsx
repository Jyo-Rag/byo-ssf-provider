'use client';

import { useState, useEffect } from 'react';
import ConfigPanel from '@/components/ConfigPanel';
import KeysPanel from '@/components/KeysPanel';
import ProviderPanel from '@/components/ProviderPanel';
import RiskEventForm from '@/components/RiskEventForm';
import EventHistory from '@/components/EventHistory';
import type { EventHistoryItem } from '@/lib/types';

export default function Home() {
  const [oktaOrgUrl, setOktaOrgUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [publicAppUrl, setPublicAppUrl] = useState('');
  const [providerId, setProviderId] = useState('');
  const [eventHistory, setEventHistory] = useState<EventHistoryItem[]>([]);
  const [appUrl, setAppUrl] = useState('');
  const [hasKeys, setHasKeys] = useState(false);

  // Load saved config from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('oktaOrgUrl');
    const savedApiKey = localStorage.getItem('oktaApiKey');
    const savedPublicAppUrl = localStorage.getItem('publicAppUrl');
    const savedProviderId = localStorage.getItem('ssfProviderId');
    if (savedUrl) setOktaOrgUrl(savedUrl);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedPublicAppUrl) setPublicAppUrl(savedPublicAppUrl);
    if (savedProviderId) setProviderId(savedProviderId);
    setAppUrl(window.location.origin);
  }, []);

  const handleEventSent = (event: EventHistoryItem) => {
    setEventHistory((prev) => [event, ...prev]);
  };

  const handleClearHistory = () => {
    setEventHistory([]);
  };

  const isConfigured = hasKeys && oktaOrgUrl && apiKey && publicAppUrl;

  return (
    <>
      {/* Okta-style header */}
      <header className="bg-okta-blue-dark text-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <svg className="w-7 h-7 flex-shrink-0 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">BYO SSF Provider</h1>
            <p className="text-sm text-white/70">
              Send CAEP Risk Change events to Okta via the Shared Signals Framework
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Warning if no config */}
        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-amber-800">Configuration Required</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Complete the steps below to start sending risk signals to Okta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Signing Keys */}
        <div className="flex items-center gap-3 mb-3">
          <span className="w-7 h-7 rounded-full bg-okta-blue text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 shadow-sm">1</span>
          <span className="text-sm font-semibold text-okta-charcoal tracking-wide uppercase" style={{ letterSpacing: '0.04em' }}>Generate Signing Keys</span>
        </div>
        <KeysPanel onKeysReady={setHasKeys} />

        {/* Step 2: Config Panel */}
        <div className="flex items-center gap-3 mb-3">
          <span className="w-7 h-7 rounded-full bg-okta-blue text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 shadow-sm">2</span>
          <span className="text-sm font-semibold text-okta-charcoal tracking-wide uppercase" style={{ letterSpacing: '0.04em' }}>Configure Okta Connection</span>
        </div>
        <ConfigPanel
          oktaOrgUrl={oktaOrgUrl}
          apiKey={apiKey}
          publicAppUrl={publicAppUrl}
          onOktaOrgUrlChange={setOktaOrgUrl}
          onApiKeyChange={setApiKey}
          onPublicAppUrlChange={setPublicAppUrl}
        />

        {/* Step 3: Provider Panel */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 shadow-sm ${isConfigured ? 'bg-okta-blue' : 'bg-gray-300'}`}>3</span>
          <span className={`text-sm font-semibold tracking-wide uppercase ${isConfigured ? 'text-okta-charcoal' : 'text-gray-400'}`} style={{ letterSpacing: '0.04em' }}>Create Security Events Provider</span>
        </div>
        <ProviderPanel
          oktaOrgUrl={oktaOrgUrl}
          apiKey={apiKey}
          appUrl={publicAppUrl}
          providerId={providerId}
          onProviderCreated={setProviderId}
        />

        {/* Step 4: Send Events */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 shadow-sm ${providerId ? 'bg-okta-blue' : 'bg-gray-300'}`}>4</span>
          <span className={`text-sm font-semibold tracking-wide uppercase ${providerId ? 'text-okta-charcoal' : 'text-gray-400'}`} style={{ letterSpacing: '0.04em' }}>Send Risk Events</span>
        </div>
        <div className="mb-6">
          <RiskEventForm
            oktaOrgUrl={oktaOrgUrl}
            onEventSent={handleEventSent}
          />
        </div>

        {/* Event History */}
        <EventHistory
          events={eventHistory}
          onClear={handleClearHistory}
        />

        {/* App Endpoints */}
        <div className="mt-8 p-4 bg-white border border-okta-border rounded-lg text-sm">
          <h3 className="font-semibold text-okta-charcoal mb-2">App Endpoints</h3>
          <div className="space-y-1 font-mono text-xs text-okta-gray-mid">
            <p><span className="text-gray-400">Local:</span> {appUrl}</p>
            {publicAppUrl && <p><span className="text-gray-400">Public (Okta):</span> {publicAppUrl}</p>}
            <p><span className="text-gray-400">SSF Config:</span> {publicAppUrl || appUrl}/.well-known/ssf-configuration</p>
            <p><span className="text-gray-400">JWKS:</span> {publicAppUrl || appUrl}/api/jwks</p>
          </div>
        </div>
      </main>
    </>
  );
}
