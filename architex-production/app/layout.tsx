import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Architex | Built Environment OS',
  description: 'The operating system for the built environment.',
  openGraph: {
    title: 'Architex | Built Environment OS',
    description: 'The operating system for the built environment.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architex | Built Environment OS',
    description: 'The operating system for the built environment.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
