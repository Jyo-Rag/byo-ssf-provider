'use client';

import { useState, useEffect } from 'react';
import type { GenerateKeysResponse } from '@/lib/types';
import InfoDrawer from '@/components/InfoDrawer';

interface KeysPanelProps {
  onKeysReady?: (ready: boolean) => void;
}

export default function KeysPanel({ onKeysReady }: KeysPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);
  const [keyId, setKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [manualSetupVars, setManualSetupVars] = useState<GenerateKeysResponse['envVars'] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  const applyKeyData = (data: GenerateKeysResponse) => {
    const ready = data.hasKeys ?? false;
    setHasKeys(ready);
    setKeyId(data.keyId ?? null);
    onKeysReady?.(ready);
  };

  useEffect(() => {
    fetch('/api/generate-keys')
      .then((r) => r.json())
      .then((data: GenerateKeysResponse) => applyKeyData(data))
      .catch(() => {/* server not ready yet */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckKeys = async () => {
    setIsChecking(true);
    setCheckFailed(false);
    try {
      const response = await fetch('/api/generate-keys');
      const data: GenerateKeysResponse = await response.json();
      if (data.hasKeys) {
        applyKeyData(data);
        setManualSetupVars(null);
      } else {
        setCheckFailed(true);
      }
    } catch {
      setCheckFailed(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setJustGenerated(false);

    try {
      const response = await fetch('/api/generate-keys', { method: 'POST' });
      const data: GenerateKeysResponse = await response.json();

      if (data.success && data.requiresManualSetup && data.envVars) {
        setManualSetupVars(data.envVars);
        setKeyId(data.keyId ?? null);
      } else if (data.success && data.keyId) {
        setHasKeys(true);
        setKeyId(data.keyId);
        setJustGenerated(true);
        setManualSetupVars(null);
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate keys');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-okta-border shadow-sm mb-6">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-okta-border">
          <div className="flex items-center gap-2">
            <svg style={{ width: '1.1rem', height: '1.1rem' }} className="text-okta-gray-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="font-semibold text-okta-charcoal text-sm">Signing Keys</span>
          </div>
          <div className="flex items-center gap-2">
            {hasKeys && (
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

        <div className="px-5 py-4 space-y-3">
          {manualSetupVars ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs font-semibold text-amber-800 mb-1">Manual setup required</p>
                <ol className="text-xs text-amber-700 list-decimal pl-4 space-y-0.5 mt-1">
                  <li>Copy each value below into your hosting provider&apos;s environment variables.</li>
                  <li>Redeploy the app.</li>
                  <li>Click <span className="font-semibold">Check — I&apos;ve redeployed</span> to confirm the keys are active before continuing.</li>
                </ol>
              </div>
              {Object.entries(manualSetupVars).map(([key, value]) => (
                <div key={key} className="p-3 bg-okta-bg rounded-md border border-okta-border space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-semibold text-okta-charcoal">{key}</p>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(value)}
                      className="text-xs text-okta-blue hover:text-okta-blue-hover font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={value}
                    rows={value.includes('\n') ? 4 : 1}
                    className="w-full text-xs font-mono text-okta-gray-mid bg-transparent resize-none border-0 outline-none p-0"
                  />
                </div>
              ))}
              {checkFailed && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700">
                    Keys not detected yet — make sure you&apos;ve added all three env vars and the redeploy has finished.
                  </p>
                </div>
              )}
              <button
                onClick={handleCheckKeys}
                disabled={isChecking}
                className="w-full py-2.5 px-4 bg-okta-blue text-white font-semibold text-sm rounded-md hover:bg-okta-blue-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Checking...
                  </>
                ) : (
                  'Check — I\'ve redeployed'
                )}
              </button>
            </div>
          ) : hasKeys && keyId ? (
            <div className="space-y-3">
              <div className="p-3 bg-okta-bg rounded-md text-xs space-y-1 border border-okta-border">
                <p className="text-okta-gray-mid font-medium">Current Key ID</p>
                <p className="font-mono text-okta-charcoal break-all">{keyId}</p>
              </div>

              {justGenerated && (
                <div className="p-3 bg-okta-blue-light border border-okta-blue/20 rounded-md">
                  <p className="text-xs text-okta-blue-dark">
                    New keys saved to <span className="font-mono">.env.local</span>. The server will reload automatically — re-create your Okta provider to register the new public key.
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2 px-3 text-sm border border-okta-border rounded-md hover:bg-okta-bg transition-colors text-okta-charcoal disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? 'Generating...' : 'Regenerate Keys'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-okta-blue text-white font-semibold rounded-md hover:bg-okta-blue-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Keys...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Generate Signing Keys
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <InfoDrawer isOpen={showInfo} onClose={() => setShowInfo(false)} title="About Signing Keys">
        <p>
          Security Event Tokens (SETs) must be cryptographically signed so Okta can verify they
          came from this app and haven&apos;t been tampered with. This uses an{' '}
          <span className="font-medium text-okta-charcoal">RSA 2048-bit key pair</span>:
        </p>
        <ul className="space-y-2 pl-4 list-disc text-okta-gray-mid">
          <li>
            The <span className="font-medium text-okta-charcoal">private key</span> stays on this
            server and signs every event token before it is sent.
          </li>
          <li>
            The <span className="font-medium text-okta-charcoal">public key</span> is published at{' '}
            <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">/api/jwks</span> so
            Okta can fetch it and verify the signature.
          </li>
        </ul>
        <p className="text-xs text-okta-gray-mid">
          Keys are saved to{' '}
          <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">.env.local</span> and
          never leave this machine. You only need to regenerate them if you want to rotate credentials.
        </p>
      </InfoDrawer>
    </>
  );
}
