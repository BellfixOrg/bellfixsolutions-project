import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = false }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center group shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="BELL FIX & SOLUTIONS"
        width={180}
        height={60}
        priority
        className={`h-10 sm:h-14 w-auto object-contain transition-opacity group-hover:opacity-90 ${
          light ? 'brightness-0 invert' : ''
        }`}
      />
    </Link>
  );
}
