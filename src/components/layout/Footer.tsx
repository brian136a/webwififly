import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface FooterProps {
  hideBack?: boolean;
}

export default function Footer({ hideBack = false }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Back button or Copyright */}
          <div className="flex items-center gap-4">
            {!hideBack && (
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
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
              <p className="text-sm text-gray-400">© Wififly 2025</p>
            )}
            <Link 
              href="/contact"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              href="/privacy"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
