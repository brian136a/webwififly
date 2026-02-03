import Link from 'next/link';
import { Wifi } from 'lucide-react';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-cyan-500 p-3 rounded-xl shadow-lg">
              <Wifi className="w-6 h-6 md:w-8 md:h-8 text-white" />
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
            <Link 
              href="/contact" 
              className="text-gray-200 hover:text-white transition-colors text-sm md:text-base"
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-200 hover:text-white transition-colors text-sm md:text-base"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
