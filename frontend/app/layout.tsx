import type { Metadata } from 'next';
import './globals.css';
import '@/styles/network.css';
export const metadata: Metadata = {
  title: 'The Network — A graph of public belief',
  description:
    'Explore the people, shared work, and public recommendations behind a name.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
