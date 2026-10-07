import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'STATXI — Plataforma de Minijuegos de Estadísticas de Fútbol',
  description:
    'Portal definitivo de minijuegos basados en datos reales de futbolistas, clubes y competiciones. Wordle + Sporcle + Fantasy Football.',
  keywords: ['futbol', 'estadisticas', 'minijuegos', 'statxi', 'quiz de futbol', 'daily challenge', 'lamine yamal', 'haaland', 'mbappe'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pb-20 md:pb-0`}>
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
