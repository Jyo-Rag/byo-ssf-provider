'use client';

import { useState } from 'react';
import type { EventHistoryItem } from '@/lib/types';

interface EventHistoryProps {
  events: EventHistoryItem[];
  onClear: () => void;
}

const RISK_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function EventHistory({ events, onClear }: EventHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event History</h2>
        <p className="text-gray-500 text-center py-8">
          No events sent yet. Use the form above to send a risk event.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Event History</h2>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {events.map((event) => {
          const isExpanded = expandedId === event.id;
          return (
            <div
              key={event.id}
              className={`rounded-md border ${
                event.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(event.id)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {event.success ? (
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className="font-medium text-gray-900 truncate">
                        {event.userIdentifier}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${RISK_LEVEL_COLORS[event.previousLevel]}`}>
                        {event.previousLevel}
                      </span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${RISK_LEVEL_COLORS[event.currentLevel]}`}>
                        {event.currentLevel}
                      </span>
                    </div>

                    {event.error && (
                      <p className="mt-1 text-xs text-red-600 truncate" title={event.error}>
                        {event.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="mt-1 text-xs text-gray-500 font-mono truncate" title={event.id}>
                  {event.id}
                </div>
              </button>

              {isExpanded && event.decodedPayload && (
                <div className="px-3 pb-3 border-t border-gray-200 mt-2 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Decoded JWT Payload
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(JSON.stringify(event.decodedPayload, null, 2));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-3 bg-gray-900 text-green-400 rounded-md text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    {JSON.stringify(event.decodedPayload, null, 2)}
                  </pre>

                  {event.oktaResponse !== undefined && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Okta Response (HTTP {event.oktaStatus})
                      </span>
                      <pre className="mt-2 p-3 bg-blue-900 text-blue-200 rounded-md text-xs overflow-x-auto">
                        {event.oktaResponse || '(empty response)'}
                      </pre>
                    </div>
                  )}

                  {event.token && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Signed JWT
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(event.token!);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="p-3 bg-gray-900 text-amber-400 rounded-md text-xs overflow-x-auto max-h-24 overflow-y-auto break-all whitespace-pre-wrap">
                        {event.token}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}
