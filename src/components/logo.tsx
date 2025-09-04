import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/logo-dark.png"
        alt="Vollkorn Logo"
        width={120}
        height={60}
        className={cn("object-contain dark:hidden", className)}
        priority 
      />
      <Image
        src="/logo-light.png"
        alt="Vollkorn Logo"
        width={120}
        height={60}
        className={cn("object-contain hidden dark:block", className)}
        priority
      />
    </>
  );
}
