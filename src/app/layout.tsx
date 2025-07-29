import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Belleza, Alegreya } from 'next/font/google';
import { cn } from "@/lib/utils"

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
});


export const metadata: Metadata = {
  title: 'Vollkorn ERP Lite',
  description: 'ERP para Vollkorn.cl',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-body antialiased",
          belleza.variable,
          alegreya.variable
        )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
