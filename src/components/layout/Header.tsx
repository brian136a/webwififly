import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="relative w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-white font-semibold text-lg hidden sm:inline">Wififly</span>
            </Link>
          </div>

          {/* Navigation Links - Right Side */}
          <div className="flex items-center gap-6">
            <Link 
              href="/contact" 
              className="text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              Contact
            </Link>
            <Link 
              href="/docs" 
              className="text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              Technical Docs
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
