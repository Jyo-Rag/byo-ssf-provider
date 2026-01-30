import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SSF Transmitter for Okta',
  description: 'Send CAEP Risk Change events to Okta via the Shared Signals Framework',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
