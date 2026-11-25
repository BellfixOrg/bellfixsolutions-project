import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BELL FIX & SOLUTIONS – Professional Home Services',
  description:
    'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
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
