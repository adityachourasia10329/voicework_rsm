import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceWork RSM | Enterprise AI Audio Separation & Video Remuxing',
  description:
    'SOTA Stem Isolation (BS-RoFormer, DeepFilterNet3), Zero-Loss Lossless Video Remuxing, and Surgical Visual Spectrogram Editing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
