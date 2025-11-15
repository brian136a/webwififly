import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';

const personas = [
  {
    id: 1,
    title: 'Slow WiFi',
    icon: '🐌',
    description: 'Streaming buffers constantly',
  },
  {
    id: 2,
    title: 'Dead Zones',
    icon: '📡',
    description: 'No signal in some rooms',
  },
  {
    id: 3,
    title: 'Disconnections',
    icon: '🔌',
    description: 'WiFi keeps dropping',
  },
  {
    id: 4,
    title: 'Gaming Lag',
    icon: '🎮',
    description: 'Multiplayer feels sluggish',
  },
  {
    id: 5,
    title: 'Video Calls',
    icon: '📞',
    description: 'Meetings freeze and stutter',
  },
  {
    id: 6,
    title: 'Too Crowded',
    icon: '👥',
    description: 'Slows down with many devices',
  },
  {
    id: 7,
    title: 'Setup Help',
    icon: '❓',
    description: 'Not sure what to check',
  },
  {
    id: 8,
    title: 'Device Issues',
    icon: '📱',
    description: 'Only some devices have problems',
  },
  {
    id: 9,
    title: 'New Home',
    icon: '🏠',
    description: 'Just moved, need baseline',
  },
];

export default function Struggle() {
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      await api.analytics.log('struggle_selected', { struggles: selected });
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-content container">
        <h1 className="text-center mb-2">How's Your WiFi Really Performing?</h1>
        <p className="text-center text-gray-600 mb-12">
          Select any that apply (pick one or more)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {personas.map(persona => (
            <button
              key={persona.id}
              onClick={() => handleToggle(persona.id)}
              className={`p-6 rounded-lg border-2 transition-all ${
                selected.includes(persona.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">{persona.icon}</div>
              <h3 className="font-bold text-lg mb-1">{persona.title}</h3>
              <p className="text-sm text-gray-600">{persona.description}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <button className="btn-secondary" disabled={loading}>
              Back
            </button>
          </Link>
          <Link href="/setup">
            <button
              className="btn-primary"
              onClick={handleContinue}
              disabled={loading || selected.length === 0}
            >
              {loading ? 'Loading...' : 'Next: Setup'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
