import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
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
    'Portal de minijuegos basados en datos reales de futbolistas, clubes y competiciones. Wordle + Sporcle + Fantasy Football.',
  keywords: ['futbol', 'estadisticas', 'minijuegos', 'statxi', 'quiz de futbol', 'daily challenge'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950`}>
        <div className="flex min-h-screen">
          {/* Menú en el lateral izquierdo */}
          <Sidebar />

          {/* Área principal a la derecha */}
          <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-8">
            <MobileHeader />
            <main className="flex-1 w-full">{children}</main>
          </div>
        </div>

        {/* Barra inferior táctil exclusiva para móviles */}
        <BottomNav />
      </body>
    </html>
  );
}
