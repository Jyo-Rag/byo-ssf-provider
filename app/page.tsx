'use client';

import { useState, useEffect } from 'react';
import ConfigPanel from '@/components/ConfigPanel';
import RiskEventForm from '@/components/RiskEventForm';
import EventHistory from '@/components/EventHistory';
import type { EventHistoryItem } from '@/lib/types';

export default function Home() {
  const [oktaOrgUrl, setOktaOrgUrl] = useState('');
  const [eventHistory, setEventHistory] = useState<EventHistoryItem[]>([]);
  const [appUrl, setAppUrl] = useState('');

  // Load saved config from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('oktaOrgUrl');
    if (savedUrl) {
      setOktaOrgUrl(savedUrl);
    }
    setAppUrl(window.location.origin);
  }, []);

  const handleEventSent = (event: EventHistoryItem) => {
    setEventHistory((prev) => [event, ...prev]);
  };

  const handleClearHistory = () => {
    setEventHistory([]);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          SSF Transmitter
        </h1>
        <p className="text-gray-600">
          Send CAEP Assurance Level Change events to Okta via the Shared Signals Framework
        </p>
      </div>

      {/* Warning if no config */}
      {!oktaOrgUrl && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">Configuration Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please configure your Okta organization URL to start sending events.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Config Panel */}
      <ConfigPanel
        oktaOrgUrl={oktaOrgUrl}
        onOktaOrgUrlChange={setOktaOrgUrl}
      />

      {/* Risk Event Form */}
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

      {/* Setup Instructions */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Okta Setup Instructions</h3>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Navigate to Security → Identity Threat Protection → Shared Signals in your Okta Admin Console</li>
          <li>Click &quot;Add shared signal provider&quot;</li>
          <li>Enter your app&apos;s issuer URL and JWKS URL</li>
          <li>Save and verify the connection</li>
        </ol>
        <div className="mt-3 p-2 bg-gray-200 rounded text-xs font-mono">
          <p><strong>JWKS URL:</strong> {appUrl}/api/jwks</p>
        </div>
      </div>
    </main>
  );
}
