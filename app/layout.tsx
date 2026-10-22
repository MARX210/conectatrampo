import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConectaTrampo — oportunidades em Joinville',
  description: 'Encontre oportunidades de trabalho, freelances e profissionais em Joinville, SC.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
