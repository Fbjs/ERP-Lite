import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Vollkorn Logo"
      width={120}
      height={60}
      className={cn("object-contain", className)}
      priority // Carga el logo más rápido
    />
  );
}
