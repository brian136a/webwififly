import Link from 'next/link';
import { Wifi } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
        <div className="bg-cyan-500 p-3 rounded-xl shadow-lg">
          <Wifi className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Welcome to Wififly.
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-12">
            Find out if you are getting the speeds you are paying for.
          </p>

          <Link href="/struggle" className="inline-block">
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-lg px-12 py-4 rounded-full shadow-lg transition-colors duration-300">
              Test
            </button>
          </Link>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
