import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'BYO SSF Provider - Send Risk Signals to Okta',
  description: 'Send CAEP Risk Change events to Okta via the Shared Signals Framework',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-okta-bg min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
