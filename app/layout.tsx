import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BELL FIX & SOLUTIONS – Professional Home Services',
  description:
    'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'BELL FIX & SOLUTIONS – Professional Home Services',
    description:
      'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'BELL FIX & SOLUTIONS – Professional Home Services',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BELL FIX & SOLUTIONS – Professional Home Services',
    description:
      'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
    images: [DEFAULT_OG_IMAGE],
  },
  verification: {
    google: 'googleff78e55ad0638ace',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Open+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-[#101820]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
