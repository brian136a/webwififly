'use client';

import { IconType } from 'react-icons';

interface StruggleCardProps {
  name: string;
  problem: string;
  icon: IconType;
}

export default function StruggleCard({ name, problem, icon: Icon }: StruggleCardProps) {
  return (
    <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 cursor-pointer group overflow-hidden hover:scale-105 transition-transform duration-300">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/20 group-hover:to-cyan-500/10 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      {/* Border glow effect */}
      <div className="absolute inset-0 border border-cyan-500/0 rounded-lg group-hover:border-cyan-500/50 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon - fades in on hover */}
        <div className="mb-4 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
          <Icon className="w-8 h-8 text-cyan-400" />
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>

        {/* Problem */}
        <p className="text-gray-300 text-sm">{problem}</p>
      </div>
    </div>
  );
}
