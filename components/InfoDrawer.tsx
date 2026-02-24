'use client';

import { useEffect } from 'react';

interface InfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InfoDrawer({ isOpen, onClose, title, children }: InfoDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Transparent backdrop — captures outside clicks only when open */}
      <div
        className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sliding drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-okta-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-okta-border flex items-center justify-between flex-shrink-0 bg-okta-blue-dark">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors rounded p-0.5"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 text-sm text-okta-gray-mid space-y-4">
          {children}
        </div>
      </div>
    </>
  );
}
