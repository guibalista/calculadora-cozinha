import type { Metadata, Viewport } from "next";
import { Playfair_Display, Nunito } from 'next/font/google'
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Despensa — Planejamento de Cardápio",
  description: "Planeje refeições sem desperdício para casas de aluguel, pousadas e eventos.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${playfair.variable} ${nunito.variable}`}>
      <body className="min-h-full flex flex-col" style={{ background: '#1C1712', color: '#F2EBE0' }}>
        {children}
      </body>
    </html>
  );
}
