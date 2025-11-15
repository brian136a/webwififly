'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';

export default function App({ Component, pageProps }: any) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize session on app load
    const initSession = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        await api.session.start(sessionId);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setIsReady(true);
      }
    };

    initSession();
  }, []);

  if (!isReady) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <Component {...pageProps} />;
}
