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
                src="/logo.svg" 
                alt="Wififly Logo" 
                fill
                className="rounded-xl shadow-lg"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">
              Wififly
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              href="/struggle" 
              className="text-gray-200 hover:text-white transition-colors text-sm md:text-base"
            >
              Test Speed
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
