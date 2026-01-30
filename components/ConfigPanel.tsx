'use client';

import { useState, useEffect } from 'react';

interface ConfigPanelProps {
  oktaOrgUrl: string;
  onOktaOrgUrlChange: (url: string) => void;
}

export default function ConfigPanel({ oktaOrgUrl, onOktaOrgUrlChange }: ConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localUrl, setLocalUrl] = useState(oktaOrgUrl);

  useEffect(() => {
    setLocalUrl(oktaOrgUrl);
  }, [oktaOrgUrl]);

  const handleSave = () => {
    const trimmedUrl = localUrl.trim().replace(/\/$/, ''); // Remove trailing slash
    onOktaOrgUrlChange(trimmedUrl);
    localStorage.setItem('oktaOrgUrl', trimmedUrl);
    setIsExpanded(false);
  };

  const isValidUrl = () => {
    try {
      const url = new URL(localUrl);
      return url.protocol === 'https:' && localUrl.includes('okta');
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="font-medium text-gray-700">Configuration</span>
          {oktaOrgUrl && (
            <span className="text-sm text-gray-500 truncate max-w-xs">
              ({oktaOrgUrl})
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="oktaUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Okta Organization URL
              </label>
              <input
                type="url"
                id="oktaUrl"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="https://your-org.okta.com"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  localUrl && !isValidUrl() ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {localUrl && !isValidUrl() && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid Okta HTTPS URL (e.g., https://your-org.okta.com)
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This is stored in your browser&apos;s local storage
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={!isValidUrl()}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
