'use client';

import { useState } from 'react';
import type { RiskEventFormData, RiskLevel, SubjectFormat, TransmitResponse, EventHistoryItem } from '@/lib/types';

interface RiskEventFormProps {
  oktaOrgUrl: string;
  onEventSent: (event: EventHistoryItem) => void;
}

const RISK_LEVELS: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export default function RiskEventForm({ oktaOrgUrl, onEventSent }: RiskEventFormProps) {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<SubjectFormat>('email');
  const [currentLevel, setCurrentLevel] = useState<RiskLevel>('high');
  const [previousLevel, setPreviousLevel] = useState<RiskLevel>('low');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oktaOrgUrl) {
      setError('Please configure your Okta organization URL first');
      return;
    }

    if (!userIdentifier.trim()) {
      setError('Please enter a user identifier');
      return;
    }

    if (currentLevel === previousLevel) {
      setError('Current and previous risk levels must be different');
      return;
    }

    setIsSubmitting(true);

    const formData: RiskEventFormData = {
      userIdentifier: userIdentifier.trim(),
      identifierType,
      currentLevel,
      previousLevel,
      reason: reason.trim(),
    };

    try {
      const response = await fetch('/api/transmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oktaOrgUrl,
          event: formData,
        }),
      });

      const result: TransmitResponse = await response.json();

      const historyItem: EventHistoryItem = {
        id: result.eventId || `local_${Date.now()}`,
        timestamp: new Date(),
        userIdentifier: formData.userIdentifier,
        currentLevel: formData.currentLevel,
        previousLevel: formData.previousLevel,
        success: result.success,
        error: result.error,
      };

      onEventSent(historyItem);

      if (result.success) {
        // Clear form on success
        setUserIdentifier('');
        setReason('');
      } else {
        setError(result.error || result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send event';
      setError(errorMessage);

      onEventSent({
        id: `error_${Date.now()}`,
        timestamp: new Date(),
        userIdentifier: formData.userIdentifier,
        currentLevel: formData.currentLevel,
        previousLevel: formData.previousLevel,
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Risk Event</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* User Identifier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Identifier
          </label>
          <div className="flex gap-2">
            <input
              type={identifierType === 'email' ? 'email' : 'text'}
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              placeholder={identifierType === 'email' ? 'user@example.com' : 'User ID'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <select
              value={identifierType}
              onChange={(e) => setIdentifierType(e.target.value as SubjectFormat)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="email">Email</option>
              <option value="opaque">Okta User ID</option>
            </select>
          </div>
        </div>

        {/* Risk Levels */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Level
            </label>
            <select
              value={previousLevel}
              onChange={(e) => setPreviousLevel(e.target.value as RiskLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {RISK_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as RiskLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {RISK_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual indicator of change */}
        <div className="flex items-center justify-center gap-2 py-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${RISK_LEVELS.find(l => l.value === previousLevel)?.color}`}>
            {previousLevel.toUpperCase()}
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className={`px-2 py-1 rounded text-xs font-medium ${RISK_LEVELS.find(l => l.value === currentLevel)?.color}`}>
            {currentLevel.toUpperCase()}
          </span>
          {currentLevel !== previousLevel && (
            <span className={`ml-2 text-xs ${
              RISK_LEVELS.findIndex(l => l.value === currentLevel) > RISK_LEVELS.findIndex(l => l.value === previousLevel)
                ? 'text-red-600'
                : 'text-green-600'
            }`}>
              ({RISK_LEVELS.findIndex(l => l.value === currentLevel) > RISK_LEVELS.findIndex(l => l.value === previousLevel)
                ? 'Increase'
                : 'Decrease'})
            </span>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why the risk level changed..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !oktaOrgUrl}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Risk Event
            </>
          )}
        </button>
      </div>
    </form>
  );
}
