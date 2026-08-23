import type {Metadata} from 'next';
import localFont from 'next/font/local';
import './globals.css'; // Global styles

const displayFont = localFont({
  src: '../public/fonts/Manrope-Variable.woff2',
  variable: '--font-ax-display',
  display: 'swap',
  weight: '200 800',
});

const bodyFont = localFont({
  src: '../public/fonts/IBMPlexSans-Variable.woff2',
  variable: '--font-ax-body',
  display: 'swap',
  weight: '400 700',
});

const monoFont = localFont({
  src: [
    { path: '../public/fonts/IBMPlexMono-Variable.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/IBMPlexMono-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-ax-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Architex OS | Datum for the Built Environment',
  description: 'Datum-oriented operating context for built-environment delivery teams.',
  openGraph: {
    title: 'Architex OS | Datum for the Built Environment',
    description: 'Datum-oriented operating context for built-environment delivery teams.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architex OS | Datum for the Built Environment',
    description: 'Datum-oriented operating context for built-environment delivery teams.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
