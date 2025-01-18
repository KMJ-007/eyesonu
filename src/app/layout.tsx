import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SettingsProvider } from '@/contexts/SettingsContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://eyesonyou.me'),
  title: 'Eyes On U',
  description: 'The feeling of being watched.',
  keywords: ['eye tracking', 'interactive art', 'digital art', 'motion tracking', 'gyroscope', 'web art', 'creative coding'],
  openGraph: {
    title: 'Eyes On U',
    description: 'The feeling of being watched.',
    url: 'https://eyesonyou.me',
    siteName: 'Eyes On U',
    images: [
      {
        url: '/ogimage.jpeg',
        width: 1200,
        height: 630,
        alt: 'Eyes On U - Interactive Art Experience'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eyes On U',
    description: 'The feeling of being watched.',
    images: ['/ogimage.jpeg'],
    creator: '@karanjanthe'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  )
}
