import Link from 'next/link';
import { Shield } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder gradient background (replace with home-bg.jpg when available) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
        {/* Dark overlay for high-contrast accessibility */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
            Professional Grade Home Network Diagnostic
          </h1>
          
          {/* Sub-headline */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Get the facts on the speed you pay for. Guided, precise, and built for New Zealand.
          </p>

          {/* Primary Action Button */}
          <Link href="/struggle" className="inline-block mb-16">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg md:text-xl px-12 py-5 rounded-full shadow-2xl transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-105">
              Start My Guided Walkthrough
            </button>
          </Link>

          {/* Privacy Guarantee Section */}
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-cyan-500/20 p-3 rounded-lg">
                    <Shield className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Privacy Guarantee
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    All network data is processed on local NZ-based cloud regions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
