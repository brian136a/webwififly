'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StruggleCardProps {
  name: string;
  problem: string;
  icon: LucideIcon;
}

export default function StruggleCard({ name, problem, icon: Icon }: StruggleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 cursor-pointer group overflow-hidden"
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/20 group-hover:to-cyan-500/10 rounded-lg"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 border border-cyan-500/0 rounded-lg group-hover:border-cyan-500/50"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon - fades in on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Icon className="w-8 h-8 text-cyan-400" />
        </motion.div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>

        {/* Problem */}
        <p className="text-gray-300 text-sm">{problem}</p>
      </div>
    </motion.div>
  );
}
