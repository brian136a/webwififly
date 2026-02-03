import Link from 'next/link';
import { MdArrowBack } from 'react-icons/md';

interface FooterProps {
  hideBack?: boolean;
}

export default function Footer({ hideBack = false }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Back button or Copyright */}
          <div className="flex items-center gap-4">
            {!hideBack && (
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors min-h-11 px-3 py-2"
              >
                <MdArrowBack className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
            )}
            {hideBack && (
              <p className="text-sm text-gray-400">© Wififly 2025</p>
            )}
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-6">
            {!hideBack && (
              <p className="text-sm text-gray-400 hidden md:block">© Wififly 2025</p>
            )}
            <Link 
              href="/struggle"
              className="text-sm text-gray-300 hover:text-white transition-colors min-h-11 px-3 py-2"
            >
              Test Speed
            </Link>
            <Link 
              href="/contact"
              className="text-sm text-gray-300 hover:text-white transition-colors min-h-11 px-3 py-2"
            >
              Contact Us
            </Link>
            <Link 
              href="/privacy"
              className="text-sm text-gray-300 hover:text-white transition-colors min-h-11 px-3 py-2"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
