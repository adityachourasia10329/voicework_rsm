import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceWork RSM — AI Audio Separation & Video Remuxing',
  description:
    'SOTA Stem Isolation (BS-RoFormer, DeepFilterNet3), Lossless Video Remuxing, and Visual Spectrogram Editing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zerodha-bg text-zerodha-text antialiased">
        {children}
      </body>
    </html>
  );
}
