'use client';

import Link from 'next/link';
import {
  MdVideocam,
  MdBolt,
  MdWifi,
  MdSchedule,
  MdPeople,
  MdShowChart,
  MdLocationOn,
  MdError,
  MdSignalCellularAlt,
} from 'react-icons/md';
import StruggleCard from '@/components/struggle/StruggleCard';

// Struggle cards data
const struggleCards = [
  {
    name: 'William',
    problem: 'Video meetings are pixelated.',
    icon: MdVideocam,
  },
  {
    name: 'Sarah',
    problem: 'Connection drops during gaming.',
    icon: MdBolt,
  },
  {
    name: 'James',
    problem: 'WiFi barely reaches the bedroom.',
    icon: MdWifi,
  },
  {
    name: 'Emma',
    problem: 'Download speeds are painfully slow.',
    icon: MdSchedule,
  },
  {
    name: 'Michael',
    problem: 'Too many devices disconnect constantly.',
    icon: MdPeople,
  },
  {
    name: 'Lisa',
    problem: 'Upload speeds ruin my work from home.',
    icon: MdShowChart,
  },
  {
    name: 'David',
    problem: 'Inconsistent speeds throughout the day.',
    icon: MdLocationOn,
  },
  {
    name: 'Rachel',
    problem: 'Provider claims speeds we don\'t actually get.',
    icon: MdError,
  },
  {
    name: 'Tom',
    problem: 'Buffering ruins my streaming experience.',
    icon: MdSignalCellularAlt,
  },
];

export default function StrugglePage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden pb-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        {/* Gradient background as fallback */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900 via-gray-900 to-purple-900" />

        {/* Darker 60% overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Tired of Bad WiFi? You&apos;re Not Alone.
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-8">
            WiFiFly loves helping Kiwis with their connections.
          </p>
        </div>

        {/* Struggle cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {struggleCards.map((card, index) => (
            <div key={index}>
              <StruggleCard
                name={card.name}
                problem={card.problem}
                icon={card.icon}
              />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link href="/setup" className="block w-full sm:w-auto">
            <div className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-12 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-center cursor-pointer min-h-11 flex items-center justify-center">
              Start Your Free Check
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
