'use client';

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

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-3 rounded-md border ${
              event.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
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

              <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatTime(event.timestamp)}
              </div>
            </div>

            <div className="mt-1 text-xs text-gray-500 font-mono truncate" title={event.id}>
              {event.id}
            </div>
          </div>
        ))}
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
