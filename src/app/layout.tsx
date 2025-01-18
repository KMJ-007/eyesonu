
import './globals.css';
import { Inter } from 'next/font/google';
import { SettingsProvider } from '@/contexts/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Eyes On U',
  description: 'Interactive eye animation that follows your cursor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
