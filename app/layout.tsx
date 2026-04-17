import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CozinhaPro — Calculadora de Cardápio",
  description: "Calcule receitas, porções e custos para casas e pousadas",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col bg-[#f9f7f4] text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}
