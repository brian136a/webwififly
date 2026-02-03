import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Space background with starfield effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-black" />
        <div className="absolute inset-0 bg-black/60" />
        {/* Subtle stars effect using gradient */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent)',
          backgroundSize: '200px 200px, 300px 300px, 150px 150px, 250px 250px, 180px 180px',
        }} />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* High-contrast typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Welcome to Wififly.
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-white font-medium mb-12 drop-shadow-md">
              Find out if you are getting the speeds you are paying for.
            </p>

            {/* Guided Walk button */}
            <Link href="/struggle" className="inline-block">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xl px-16 py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105">
                Guided Walk
              </button>
            </Link>

            {/* NZ Privacy Guarantee */}
            <div className="mt-16">
              <p className="text-white text-lg font-semibold drop-shadow-md">
                🇳🇿 NZ Privacy Guarantee: Your data stays in New Zealand
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer section with Vercel link */}
      <div className="relative z-10 pb-8">
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            Powered by{' '}
            <a 
              href="https://vercel.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
            >
              Vercel
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
