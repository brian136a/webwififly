import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/images/logo-transparent.png"
                alt="WiFiFly Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>


        </div>
      </div>
    </header>
  );
}
