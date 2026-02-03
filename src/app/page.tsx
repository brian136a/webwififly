'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import { MdArrowForward, MdVerified } from 'react-icons/md';

export default function Home() {
  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden">
      {/* Background Image with Parallax-like fix */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/background-desktop.webp"
          alt="Modern Home Office"
          fill
          className="object-cover"
          priority
          placeholder="blur" 
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
        />
        {/* Sophisticated Overlay: Gradient + slight dark tint */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pb-24 md:pb-32 lg:pb-40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Brand Highlight */}
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-sm font-semibold tracking-wide uppercase backdrop-blur-sm">
                Next Gen Speed Testing
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white tracking-tight drop-shadow-2xl">
              Welcome to <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">WiFiFly</span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Find out if you are really getting the speeds you pay for. 
              <span className="block mt-2 text-cyan-100/80">Simple. Accurate. Local.</span>
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/struggle" className="group">
                <button className="relative bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-lg md:text-xl px-12 py-5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] flex items-center gap-3 min-h-11">
                  Start Guided Walk
                  <MdArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Privacy Badge */}
            <div className="mt-16 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <MdVerified className="w-4 h-4 text-emerald-400" />
              <p className="text-gray-200 text-xs md:text-sm font-medium whitespace-nowrap">
                NZ Privacy Guarantee: Your data stays in New Zealand
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
