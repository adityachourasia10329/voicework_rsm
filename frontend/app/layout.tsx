import type { Metadata } from 'next';
import './globals.css';
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VoiceWork RSM — AI Audio Separation & Surgical Spectrogram Editor',
  description:
    'Enterprise-grade AI Audio Separation (BS-RoFormer, DeepFilterNet3), Zero-Loss Video Remuxing, and Visual Spectrogram Editing with Surgical Micro-Inference.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0D0E15] text-[#F3F4F8] antialiased selection:bg-[#FF4D36]/30 selection:text-white relative overflow-x-hidden font-sans">
        {/* Background Engineering Grid (bpssite style) */}
        <div className="engineering-grid pointer-events-none fixed inset-0 z-0" />
        
        {/* Ambient Radial Lights (Superlist Coral & Purple ambient flares) */}
        <div className="ambient-glow pointer-events-none fixed top-[-15%] left-[20%] w-[65vw] h-[45vh] z-0" />
        <div className="ambient-glow-pink pointer-events-none fixed bottom-[-10%] right-[10%] w-[45vw] h-[40vh] z-0" />

        {/* App Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
