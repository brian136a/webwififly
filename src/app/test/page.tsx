'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MdError, MdLoop } from 'react-icons/md';
import { useSetupStore } from '@/store/setupStore';
import {
  getSpeedtestConfig,
  runFullSpeedtest,
  type SpeedtestConfig,
  type TestRunResult,
} from '@/backend/speedtestRunner';

type TestState = 'idle' | 'testing' | 'success' | 'error' | 'finished';

interface DashboardResult {
  room: string;
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
  anomaly?: boolean;
  isModemTest?: boolean;
}

export default function TestPage() {
  const router = useRouter();
  const { modemRoom, additionalRooms, addTestResult } = useSetupStore();

  const allRooms = [modemRoom, ...additionalRooms].filter(room => room.trim() !== '');

  const [config, setConfig] = useState<SpeedtestConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [testState, setTestState] = useState<TestState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [dashboardResults, setDashboardResults] = useState<DashboardResult[]>([]);
  const [isPageBackground, setIsPageBackground] = useState(false);
  const [pausedTest, setPausedTest] = useState(false);

  const currentRoom = allRooms[currentRoomIndex] || '';
  const isLastRoom = currentRoomIndex === allRooms.length - 1;
  const roomNumber = currentRoomIndex + 1;
  const totalRooms = allRooms.length;

  // Load config on mount
  useEffect(() => {
    (async () => {
      try {
        const cfg = await getSpeedtestConfig();
        setConfig(cfg);
      } catch (err) {
        setConfigError(err instanceof Error ? err.message : 'Failed to load config');
      }
    })();
  }, []);

  // Detect page background/focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsPageBackground(hidden);

      if (hidden && testState === 'testing') {
        setPausedTest(true);
        setError('⚠️ Test paused: Tab is in background. Switch back to continue.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testState]);

  const handleStartTest = useCallback(async () => {
    if (!config) {
      setError('Config not loaded');
      return;
    }

    if (document.hidden) {
      setError('⚠️ Tab is in background. Click on this window to bring it to focus.');
      return;
    }

    try {
      setError(null);
      setTestState('testing');
      setProgress(0);
      setProgressText('Starting...');
      setPausedTest(false);

      // Get session ID from store or localStorage
      const sessionId = localStorage.getItem('wififly_sessionId') || 'unknown';

      // Run the full speedtest
      const isModemTest = currentRoom === modemRoom;
      const result = await runFullSpeedtest(sessionId, currentRoom, config, (state, pct) => {
        setProgressText(state);
        setProgress(pct);
      }, isModemTest);

      // Add to store
      addTestResult({
        room: currentRoom,
        result: { dl: result.dl, ul: result.ul, ping: result.ping, jitter: result.jitter },
        timestamp: Date.now(),
      });

      // Add to dashboard
      setDashboardResults(prev => {
        const updated = [
          ...prev,
          {
            room: currentRoom,
            dl: result.displayDlMbps,
            ul: result.displayUlMbps,
            ping: result.ping,
            jitter: result.jitter,
            anomaly: result.anomaly,
            isModemTest,
          },
        ];
        return updated.sort((a, b) => b.dl - a.dl);
      });

      setTestState('success');
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Test failed');
      setTestState('error');
    }
  }, [config, currentRoom, addTestResult]);

  const handleNextRoom = useCallback(() => {
    if (currentRoomIndex < allRooms.length - 1) {
      setCurrentRoomIndex(prev => prev + 1);
      setTestState('idle');
      setProgress(0);
      setProgressText('');
      setError(null);
    } else {
      setTestState('finished');
      router.push('/analysis');
    }
  }, [currentRoomIndex, allRooms.length, router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setTestState('idle');
    setProgress(0);
    setProgressText('');
  }, []);

  useEffect(() => {
    if (allRooms.length === 0) {
      router.push('/setup');
    }
  }, [allRooms.length, router]);

  if (allRooms.length === 0 || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>{!config ? 'Loading config...' : 'Redirecting to setup...'}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh flex flex-col text-white p-4 pb-24 pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col flex-1 gap-8">
        {/* Error & Warning Banners */}
        {(error || configError) && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-center">
            <p className="text-red-400 font-semibold text-sm">{error || configError}</p>
          </div>
        )}

        {isPageBackground && testState === 'testing' && (
          <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-center">
            <p className="text-yellow-400 font-semibold text-sm">⚠️ Tab is in background - test paused</p>
          </div>
        )}

        {/* Header & Status */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {testState === 'finished'
              ? 'Test Complete!'
              : testState === 'testing'
              ? `Testing ${currentRoom}`
              : `Ready to Test ${currentRoom}`}
          </h1>
          <p className="text-md text-gray-300 mb-1">
            Room {roomNumber} of {totalRooms}
          </p>
          {currentRoom === modemRoom && (
            <p className="text-sm text-cyan-400 font-medium">
              📡 Modem Location - Full Test (includes ping, jitter & upload)
            </p>
          )}
          {currentRoom !== modemRoom && modemRoom && (
            <p className="text-sm text-blue-400">
              📶 WiFi Test - Download speed only (5 seconds)
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {testState === 'testing' && (
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-cyan-400 text-center">{progressText}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {testState === 'idle' && (
            <button
              onClick={handleStartTest}
              disabled={!!error || !!configError}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-12 py-3 rounded-lg min-h-11 transition-transform hover:scale-105 active:scale-95"
            >
              Start Test
            </button>
          )}

          {testState === 'testing' && (
            <div className="text-center">
              <MdLoop className="w-6 h-6 animate-spin inline text-cyan-400" />
            </div>
          )}

          {testState === 'success' && (
            <button
              onClick={handleNextRoom}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-12 py-3 rounded-lg min-h-11 transition-transform hover:scale-105 active:scale-95"
            >
              {isLastRoom ? 'View Analysis' : 'Next Room'}
            </button>
          )}

          {testState === 'error' && (
            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-3 rounded-lg min-h-11 transition-transform hover:scale-105 active:scale-95"
              >
                Retry
              </button>
              <button
                onClick={handleNextRoom}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-lg min-h-11 transition-transform hover:scale-105 active:scale-95"
              >
                {isLastRoom ? 'Skip' : 'Skip Room'}
              </button>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 min-h-75 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6 overflow-y-auto">
          {dashboardResults.length === 0 ? (
            <p className="text-gray-400 text-center">Results will appear here</p>
          ) : (
            <div className="space-y-4">
              {dashboardResults.map((result, i) => (
                <div
                  key={result.room}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.room}</span>
                    <div className="flex items-center gap-2">
                      {result.isModemTest ? (
                        <span className="text-xs text-cyan-400">📡 Modem</span>
                      ) : (
                        <span className="text-xs text-blue-400">📶 WiFi</span>
                      )}
                      {result.anomaly && <span className="text-xs text-orange-400">🚩 Anomaly</span>}
                    </div>
                  </div>
                  <p className="text-sm text-cyan-300">
                    {result.isModemTest ? (
                      <>↓ {Math.round(result.dl)} Mbps | ↑ {Math.round(result.ul)} Mbps | Ping {Math.round(result.ping)}ms | Jitter {Math.round(result.jitter)}ms</>
                    ) : (
                      <>↓ {Math.round(result.dl)} Mbps <span className="text-gray-400">(WiFi speed test)</span></>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}