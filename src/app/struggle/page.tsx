'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Video,
  Zap,
  Wifi,
  Clock,
  Users,
  BarChart3,
  MapPin,
  AlertCircle,
  Signal,
} from 'lucide-react';
import StruggleCard from '@/components/struggle/StruggleCard';

// Struggle cards data
const struggleCards = [
  {
    name: 'William',
    problem: 'Video meetings are pixelated.',
    icon: Video,
  },
  {
    name: 'Sarah',
    problem: 'Connection drops during gaming.',
    icon: Zap,
  },
  {
    name: 'James',
    problem: 'WiFi barely reaches the bedroom.',
    icon: Wifi,
  },
  {
    name: 'Emma',
    problem: 'Download speeds are painfully slow.',
    icon: Clock,
  },
  {
    name: 'Michael',
    problem: 'Too many devices disconnect constantly.',
    icon: Users,
  },
  {
    name: 'Lisa',
    problem: 'Upload speeds ruin my work from home.',
    icon: BarChart3,
  },
  {
    name: 'David',
    problem: 'Inconsistent speeds throughout the day.',
    icon: MapPin,
  },
  {
    name: 'Rachel',
    problem: 'Provider claims speeds we don&apos;t actually get.',
    icon: AlertCircle,
  },
  {
    name: 'Tom',
    problem: 'Buffering ruins my streaming experience.',
    icon: Signal,
  },
];

export default function StrugglePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pb-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        {/* Gradient background as fallback */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900 via-gray-900 to-purple-900" />

        {/* If you have the background image, uncomment this:
        <Image
          src="/images/page2-background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        */}

        {/* Darker 60% overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Tired of Bad WiFi? You&apos;re Not Alone.
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Wififly love helping Kiwis with their connections.
          </p>
        </motion.div>

        {/* Struggle cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {struggleCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <StruggleCard
                name={card.name}
                problem={card.problem}
                icon={card.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center"
        >
          <Link href="/setup" className="block">
            <motion.button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-12 py-4 rounded-full shadow-lg transition-colors duration-300 w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Check
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
