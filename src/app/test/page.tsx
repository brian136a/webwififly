'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetupStore } from '@/store/setupStore';
import {
  isSpeedtestAvailable,
  initializeSpeedtest,
  startTest,
  abortTest,
  onTestUpdate,
  onTestEnd,
  checkWorkerAccessibility,
  type SpeedtestInstance,
} from '@/lib/librespeed';
import type { LibreSpeedData, LibreSpeedTestPoint } from '@/types/librespeed';

type TestState = 'idle' | 'starting' | 'testing' | 'success' | 'error' | 'finished';

interface DashboardResult {
  room: string;
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
}

export default function TestPage() {
  const router = useRouter();
  const { modemRoom, additionalRooms, addTestResult } = useSetupStore();
  
  const allRooms = [modemRoom, ...additionalRooms].filter(room => room.trim() !== '');
  
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [testState, setTestState] = useState<TestState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [speedtestInstance, setSpeedtestInstance] = useState<SpeedtestInstance | null>(null);
  
  // Dashboard results sorted by performance
  const [dashboardResults, setDashboardResults] = useState<DashboardResult[]>([]);
  
  // Progress tracking for data-progression-based progress bar
  const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>(
    'idle'
  );
  
  // Track actual progress percentages from LibreSpeed
  const [dlProgress, setDlProgress] = useState(0); // 0-1 for download phase
  const [ulProgress, setUlProgress] = useState(0); // 0-1 for upload phase
  
  // Track last speed data for result capture when test ends
  const lastSpeedDataRef = useRef<LibreSpeedData | null>(null);
  // Watchdog timer to detect stalled tests
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Keep original Worker to restore later when patching the worker path
  const originalWorkerRef = useRef<typeof Worker | null>(null);
  const workerPatchedRef = useRef<boolean>(false);

  const currentRoom = allRooms[currentRoomIndex] || '';
  const isLastRoom = currentRoomIndex === allRooms.length - 1;
  const roomNumber = currentRoomIndex + 1;
  const totalRooms = allRooms.length;
  
  // Calculate max DL speed for 80% anchoring
  const maxDL = Math.max(...dashboardResults.map(r => r.dl), 1);
  
  // Calculate progress percentage based on test phase and actual data progress
  const getProgressPercentage = () => {
    switch (testPhase) {
      case 'idle':
        return 0;
      case 'ping':
        return 25; // Quick phase, stays at 25%
      case 'download':
        // Download phase: smoothly progress from 25% to 50%
        // dlProgress is 0-1, so map it to 25-50 range
        return 25 + (dlProgress * 25);
      case 'upload':
        // Upload phase: smoothly progress from 50% to 100%
        // ulProgress is 0-1, so map it to 50-100 range
        return 50 + (ulProgress * 50);
      case 'complete':
        return 100; // Final state
      default:
        return 0;
    }
  };

  // Fallback: Check if script loaded even if onLoad didn't fire
  useEffect(() => {
    if (scriptLoaded) return;

    console.log('[LibreSpeed] Starting fallback script detection...');

    const checkInterval = setInterval(() => {
      if (isSpeedtestAvailable()) {
        console.log('[LibreSpeed] Script detected via fallback check');
        setScriptLoaded(true);
        clearInterval(checkInterval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!isSpeedtestAvailable()) {
        console.error('[LibreSpeed] Script failed to load after 15 seconds');
        console.log('[LibreSpeed] Check Network tab - is /librespeed/speedtest.js loading?');
        setScriptError('LibreSpeed failed to initialize. Check Console and Network tab for errors.');
      }
    }, 15000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [scriptLoaded]);

  // Log script load state for debugging
  useEffect(() => {
    console.log('[LibreSpeed] Script state:', {
      scriptLoaded,
      scriptError,
      available: isSpeedtestAvailable(),
    });
  }, [scriptLoaded, scriptError]);

  // Patch global Worker to rewrite LibreSpeed worker URL to absolute path
  useEffect(() => {
    if (!scriptLoaded) return;
    if (typeof window === 'undefined') return;
    const win = window as unknown as { Worker: typeof Worker } & Record<string, unknown>;
    if (!win.Worker) return;
    if (workerPatchedRef.current) return;

    const OriginalWorker = win.Worker;
    originalWorkerRef.current = OriginalWorker;

    const PatchedWorker = function (this: any, workerUrl: any, options?: WorkerOptions): Worker {
      try {
        let urlStr = typeof workerUrl === 'string' ? workerUrl : workerUrl?.toString?.();
        if (typeof urlStr === 'string' && urlStr.startsWith('speedtest_worker.js')) {
          const suffix = urlStr.substring('speedtest_worker.js'.length); // keep ?r=...
          const absoluteUrl = `/librespeed/speedtest_worker.js${suffix}`;
          console.log('[LibreSpeed] Rewriting worker URL to', absoluteUrl);
          // @ts-ignore - invoke original constructor
          return new OriginalWorker(absoluteUrl as any, options as any);
        }
      } catch (e) {
        console.warn('[LibreSpeed] Worker patch error, using original URL', e);
      }
      // @ts-ignore - invoke original constructor
      return new OriginalWorker(workerUrl as any, options as any);
    } as unknown as typeof Worker;

    // Ensure instanceof checks keep working
    // @ts-ignore
    PatchedWorker.prototype = OriginalWorker.prototype;

    // Install patch
    // @ts-ignore
    win.Worker = PatchedWorker;
    workerPatchedRef.current = true;

    return () => {
      if (originalWorkerRef.current) {
        // @ts-ignore
        win.Worker = originalWorkerRef.current;
        originalWorkerRef.current = null;
        workerPatchedRef.current = false;
      }
    };
  }, [scriptLoaded]);

  const handleTestUpdate = useCallback((data: LibreSpeedData) => {
    console.log('[handleTestUpdate] Called with:', {
      testState: data.testState,
      dlStatus: data.dlStatus,
      ulStatus: data.ulStatus,
      dlProgress: data.dlProgress,
      ulProgress: data.ulProgress,
    });
    
    // Clear watchdog on first update
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
      console.log('[handleTestUpdate] Watchdog cleared');
    }
    
    lastSpeedDataRef.current = data; // Store for result capture
    
    // --- OPTION 2: Data-Driven Progress Tracking ---
    // Use LibreSpeed's dlProgress and ulProgress (0-1) for smooth bar animation
    // testState: 0=starting, 1=download, 2=ping+jitter, 3=upload, 4=finished, 5=aborted
    
    if (data.testState === 1 && testPhase !== 'download') {
      // Test has moved to the Download phase
      console.log('[handleTestUpdate] Phase: download (50% marker)');
      setTestPhase('download');
    } else if (data.testState === 3 && testPhase !== 'upload') {
      // Test has moved to the Upload phase
      console.log('[handleTestUpdate] Phase: upload (100% marker)');
      setTestPhase('upload');
    }
    
    // Update progress values from LibreSpeed data
    // These are 0-1 decimals representing progress within each phase
    if (data.dlProgress !== undefined) {
      setDlProgress(data.dlProgress);
    }
    if (data.ulProgress !== undefined) {
      setUlProgress(data.ulProgress);
    }
    
    // Note: The 'ping' phase is set manually in handleStartTest (25%)
    // and the 'complete' phase is set in handleTestEnd (final transition)
    
    if (data.testState >= 0 && data.testState <= 3) {
      setTestState('testing');
    }
  }, [testPhase]); // Added testPhase to dependency array for accurate comparison

  const handleTestEnd = useCallback((aborted: boolean) => {
    console.log('[handleTestEnd] Test ended, aborted:', aborted);
    
    // Clear watchdog
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    
    if (aborted) {
      console.error('[handleTestEnd] Test was aborted');
      setError('Test was aborted');
      setTestState('error');
      setTestPhase('idle');
      return;
    }
    
    // Derive final results from last speed data
    const lastData = lastSpeedDataRef.current;
    if (!lastData) {
      console.error('[handleTestEnd] No test data received');
      setError('No test data received');
      setTestState('error');
      setTestPhase('idle');
      return;
    }
    
    // Ensure data is rounded to integer (required constraint)
    const dl = Math.round(Number(lastData.dlStatus) || 0);
    const ul = Math.round(Number(lastData.ulStatus) || 0);
    const ping = Number(lastData.pingStatus) || 0;
    const jitter = Number(lastData.jitterStatus) || 0;
    
    console.log('[handleTestEnd] Final result (rounded):', { dl, ul, ping, jitter });
    
    const result: LibreSpeedTestPoint = { dl, ul, ping, jitter };
    
    addTestResult({
      room: currentRoom,
      result,
      timestamp: Date.now(),
    });
    
    // Add to dashboard and re-sort
    setDashboardResults(prev => {
      const updated = [...prev, { room: currentRoom, dl, ul, ping, jitter }];
      // Sort by DL speed, highest first (required constraint)
      const sorted = updated.sort((a, b) => b.dl - a.dl);
      console.log('[handleTestEnd] Dashboard updated and sorted:', sorted);
      return sorted;
    });
    
    // Trigger completion animation (100% progress)
    setTestPhase('complete');
    
    // After brief delay, transition to success state
    setTimeout(() => {
      console.log('[handleTestEnd] Transitioning to success state');
      setTestState('success');
      setTestPhase('idle'); // Reset phase after transition
    }, 300);
  }, [currentRoom, addTestResult]);

  const handleStartTest = useCallback(async () => {
    console.log('[DEBUG] handleStartTest called');
    
    if (!scriptLoaded || !isSpeedtestAvailable()) {
      console.error('[DEBUG] Script not loaded or speedtest not available');
      setError('Speed test library not loaded. Please refresh the page.');
      return;
    }

    try {
      setError(null);
      setTestState('starting');
      // --- CORRECTION: Set initial phase to PING (25% marker) ---
      setTestPhase('ping');
      // Reset progress tracking
      setDlProgress(0);
      setUlProgress(0);
      lastSpeedDataRef.current = null;

      console.log('[LibreSpeed] Starting test...');

      // Pre-flight check: verify worker file is accessible before starting
      console.log('[LibreSpeed] Pre-flight check: verifying worker accessibility...');
      const workerAccessible = await checkWorkerAccessibility();
      
      console.log('[LibreSpeed] Worker accessible:', workerAccessible);
      
      if (!workerAccessible) {
        console.error('[LibreSpeed] Pre-flight FAILED: Worker file not accessible at /librespeed/speedtest_worker.js');
        setError(
          'Speed test worker file is not accessible. The file /librespeed/speedtest_worker.js returned an error or is missing.\n\n' +
          'This will prevent the test from running. Please ensure:\n' +
          '1. File exists at public/librespeed/speedtest_worker.js\n' +
          '2. Dev server is serving static files correctly\n' +
          '3. No server configuration blocking .js files'
        );
        setTestState('error');
        setTestPhase('idle');
        return;
      }
      
      console.log('[LibreSpeed] Pre-flight OK: Worker file is accessible');

      const instance = initializeSpeedtest();
      if (!instance) {
        throw new Error('Failed to create Speedtest instance');
      }

      console.log('[DEBUG] Speedtest instance created');

      onTestUpdate(instance, handleTestUpdate);
      onTestEnd(instance, handleTestEnd);
      setSpeedtestInstance(instance);

      console.log('[LibreSpeed] Starting test. Worker should load from: /librespeed/speedtest_worker.js');

      startTest(instance, {
        time_dl: 15,
        time_ul: 15,
        count_ping: 10,
      });

      // Immediately transition to testing state
      console.log('[DEBUG] Setting testState to testing');
      setTestState('testing');
      
      // Watchdog: if no updates within 10 seconds, worker likely failed to load
      watchdogTimerRef.current = setTimeout(() => {
        console.error('[LibreSpeed] Worker failed to start - no onupdate events received within 10s');
        setError(
          'Speed test worker failed to initialize after loading. This usually means:\n\n' +
          '1. Browser blocking Web Worker creation (check Console for Worker errors)\n' +
          '2. CORS or CSP policy blocking worker execution\n' +
          '3. Worker script has syntax errors\n\n' +
          'Open DevTools → Console for Worker-related errors.'
        );
        setTestState('error');
        setTestPhase('idle');
        if (instance) {
          try {
            abortTest(instance);
          } catch {}
        }
      }, 10000);
    } catch (err) {
      console.error('[LibreSpeed] Test start error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start test');
      setTestState('error');
      setTestPhase('idle');
    }
  }, [scriptLoaded, handleTestUpdate, handleTestEnd]);

  const handleNextRoom = useCallback(() => {
    if (currentRoomIndex < allRooms.length - 1) {
      setCurrentRoomIndex(prev => prev + 1);
      setTestState('idle');
      setTestPhase('idle');
      setDlProgress(0);
      setUlProgress(0);
      setError(null);
    } else {
      setTestState('finished');
      router.push('/analysis');
    }
  }, [currentRoomIndex, allRooms.length, router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setTestState('idle');
    setTestPhase('idle');
    setDlProgress(0);
    setUlProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      // Clear watchdog on unmount
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
      }
      // Abort test on unmount
      if (speedtestInstance) {
        try {
          abortTest(speedtestInstance);
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      }
    };
  }, [speedtestInstance]);

  useEffect(() => {
    if (allRooms.length === 0) {
      router.push('/setup');
    }
  }, [allRooms.length, router]);

  if (allRooms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Redirecting to setup...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col text-white p-4 pb-24 pt-20">
      <Script
        src="/librespeed/speedtest.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[LibreSpeed] Script onLoad callback fired');
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('[LibreSpeed] Script loading error:', e);
          setScriptError('Failed to load speed test library. Check if /librespeed/speedtest.js exists.');
        }}
      />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col flex-1 gap-8">
        {/* ===== ACTION ZONE (TOP) ===== */}
        <div className="shrink-0">
          {/* Error Banner */}
          {(error || scriptError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-center"
            >
              <p className="text-red-400 font-semibold text-sm">{error || scriptError}</p>
            </motion.div>
          )}

          {/* Instruction Header & Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {testState === 'finished'
                ? 'Test Complete!'
                : testState === 'starting' || testState === 'testing'
                ? `Now Testing ${currentRoom}`
                : `Proceed to ${currentRoom}`}
            </h1>
            <p className="text-md text-gray-300">
              {testState === 'finished'
                ? 'All tests completed'
                : `Testing: ${roomNumber} of ${totalRooms}`}
            </p>
          </motion.div>

          {/* Progress Bar - Only visible during active test */}
          <AnimatePresence>
            {(testState === 'starting' || testState === 'testing') && (
              <motion.div
                key="progress-bar"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
            {testState === 'idle' && (
              <motion.div
                key="start-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center gap-4 flex-col items-center"
              >
                <div className="text-center">
                  {/* Debugging info removed for production cleaner look */}
                  <p className="text-xs text-gray-400 mb-2">
                    Start the test in the current room.
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    console.log('[BUTTON CLICK] Test button clicked');
                    handleStartTest();
                  }}
                  disabled={!scriptLoaded || !!scriptError}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg px-12 py-3 rounded-full shadow-lg transition-colors"
                >
                  {!scriptLoaded && !scriptError ? 'Loading...' : `Test ${currentRoom}`}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success/Error Actions */}
          <AnimatePresence>
            {testState === 'success' && (
              <motion.div
                key="success-action"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleNextRoom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg px-12 py-3 rounded-full shadow-lg transition-colors"
                >
                  {isLastRoom ? 'View My Analysis' : 'Next Room'}
                </motion.button>
              </motion.div>
            )}

            {testState === 'error' && (
              <motion.div
                key="error-action"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center gap-4"
              >
                <motion.button
                  onClick={handleRetry}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg px-12 py-3 rounded-full shadow-lg transition-colors"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== RESULTS DASHBOARD (BOTTOM) ===== */}
        <div className="flex-1 min-h-[300px] bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {dashboardResults.length === 0 ? (
              <motion.div
                key="empty-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <p className="text-gray-400 text-center">
                  Results will appear here as you complete tests
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {dashboardResults.map((result, index) => {
                  // Calculate bar width using the 80% anchor (required constraint)
                  // MaxDL is calculated at the component level
                  const barWidth = (result.dl / maxDL) * 80; 
                  
                  // Decide if number fits inside or outside the bar
                  // A small bar (e.g., < 15%) cannot fit the number inside
                  const barIsTooSmall = barWidth < 15; 
                  
                  return (
                    <motion.div
                      key={result.room}
                      // Layout allows Framer Motion to animate the position on re-sort
                      layout 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{result.room}</span>
                      </div>
                      
                      {/* Performance Bar with DL number at RH end (required constraint) */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex-1 h-8 bg-white/10 rounded-lg overflow-hidden relative"
                          // We use max-w-full here to contain the 80% logic visually 
                          style={{ maxWidth: '100%' }}
                        >
                          <motion.div
                            className="h-full bg-cyan-500 rounded-lg flex items-center justify-end pr-3 transition-all duration-500 ease-out"
                            initial={false} // Prevent initial animation on subsequent renders
                            animate={{ width: `${barWidth}%` }}
                            // Number displayed INSIDE the bar if it fits
                            // We place it at the far right of the bar fill.
                          >
                            {!barIsTooSmall && (
                              <span className="text-white font-bold text-sm whitespace-nowrap">
                                {Math.round(result.dl)} Mbps
                              </span>
                            )}
                          </motion.div>
                        </div>
                        
                        {/* Number displayed OUTSIDE the bar if it's too small (required constraint) */}
                        {barIsTooSmall && (
                           <span className="text-cyan-400 font-bold text-sm whitespace-nowrap">
                            {Math.round(result.dl)} Mbps
                          </span>
                        )}
                      </div>

                      {/* Upload speed in muted text underneath (required constraint) */}
                      <p className="text-xs text-gray-500 pl-2">
                        Upload: {Math.round(result.ul)} Mbps
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}