'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useSetupStore } from '@/store/setupStore';
import Autocomplete from '@/components/common/Autocomplete';
import {
  validateIsp,
  validateDownloadSpeed,
  validateCost,
  validateRoom,
  getSuggestedIsps,
  getSuggestedRooms,
  normalizeIsp,
  normalizeRoom,
  formatSpeed,
  formatCostSimple,
  ROOM_SUGGESTIONS,
} from '@/lib/validation';

const stepsTotal = 5;
const SESSION_STORAGE_KEY = 'wififly_sessionId';

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ============================================================================
// Validation Message Component
// ============================================================================

interface ValidationMessageProps {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
}

function ValidationMessage({ type, message }: ValidationMessageProps) {
  const styles = {
    error: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-300',
      icon: 'text-rose-400',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-300',
      icon: 'text-amber-400',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-300',
      icon: 'text-blue-400',
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-300',
      icon: 'text-emerald-400',
    },
  };

  const style = styles[type];

  const Icon =
    type === 'error'
      ? AlertCircle
      : type === 'warning'
        ? Info
        : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={`mt-2 flex items-start gap-2.5 px-3 py-2 rounded-lg border ${style.bg} ${style.border}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.icon}`} />
      <p className={`text-xs md:text-sm font-medium ${style.text}`}>
        {message}
      </p>
    </motion.div>
  );
}

// ============================================================================
// Main Setup Page Component
// ============================================================================

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [roomInput, setRoomInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitRetryCount, setSubmitRetryCount] = useState(0);

  const {
    isp,
    downloadSpeed,
    cost,
    modemRoom,
    additionalRooms,
    setIsp,
    setDownloadSpeed,
    setCost,
    setModemRoom,
    addAdditionalRoom,
    removeAdditionalRoom,
  } = useSetupStore();

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for existing session in localStorage
        const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
        if (existingSessionId) {
          setSessionId(existingSessionId);
          return;
        }

        // Create new session
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const data = await response.json();
        const newSessionId = data.sessionId;
        setSessionId(newSessionId);
        localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      } catch (error) {
        console.error('Session initialization failed:', error);
        // Fallback: try again after 2 seconds
        setTimeout(initializeSession, 2000);
      }
    };

    initializeSession();
  }, []);

  // Validation states
  const [ispValidation, setIspValidation] = useState(
    validateIsp(isp)
  );
  const [speedValidation, setSpeedValidation] = useState(
    validateDownloadSpeed(downloadSpeed)
  );
  const [costValidation, setCostValidation] = useState(
    validateCost(cost)
  );
  const [modemRoomValidation, setModemRoomValidation] = useState(
    validateRoom(modemRoom)
  );
  const [roomInputValidation, setRoomInputValidation] = useState<{
    valid: boolean;
    error?: string;
  }>({ valid: true });

  // Get suggestions
  const ispSuggestions = useMemo(() => getSuggestedIsps(isp), [isp]);
  const roomSuggestions = useMemo(
    () => getSuggestedRooms(roomInput),
    [roomInput]
  );

  // Handlers
  const handleIspChange = useCallback(
    (value: string) => {
      setIsp(value);
      setIspValidation(validateIsp(value));
    },
    [setIsp]
  );

  const handleIspSelect = useCallback(
    (value: string) => {
      const normalized = normalizeIsp(value);
      setIsp(normalized);
      setIspValidation(validateIsp(normalized));
    },
    [setIsp]
  );

  const handleSpeedChange = useCallback(
    (value: string) => {
      const num = value === '' ? null : Number(value);
      setDownloadSpeed(num);
      setSpeedValidation(validateDownloadSpeed(num));
    },
    [setDownloadSpeed]
  );

  const handleCostChange = useCallback(
    (value: string) => {
      const num = value === '' ? null : Number(value);
      setCost(num);
      setCostValidation(validateCost(num));
    },
    [setCost]
  );

  const handleModemRoomChange = useCallback(
    (value: string) => {
      setModemRoom(value);
      setModemRoomValidation(validateRoom(value));
    },
    [setModemRoom]
  );

  const handleModemRoomSelect = useCallback(
    (value: string) => {
      const normalized = normalizeRoom(value);
      setModemRoom(normalized);
      setModemRoomValidation(validateRoom(normalized));
    },
    [setModemRoom]
  );

  const handleRoomInputChange = (value: string) => {
    setRoomInput(value);
    setRoomInputValidation(validateRoom(value));
  };

  const handleAddRoom = useCallback(() => {
    const trimmed = roomInput.trim();
    const validation = validateRoom(trimmed);

    if (validation.valid) {
      const normalized = normalizeRoom(trimmed);
      // Check for duplicates
      if (!additionalRooms.includes(normalized)) {
        addAdditionalRoom(normalized);
        setRoomInput('');
        setRoomInputValidation({ valid: true });
      } else {
        setRoomInputValidation({
          valid: false,
          error: 'This room is already added',
        });
      }
    } else {
      setRoomInputValidation(validation);
    }
  }, [roomInput, additionalRooms, addAdditionalRoom]);

  const handleRemoveRoom = useCallback(
    (room: string) => {
      removeAdditionalRoom(room);
    },
    [removeAdditionalRoom]
  );

  // Check if current step is valid
  const isStepValid = useCallback(() => {
    switch (step) {
      case 1:
        return ispValidation.valid;
      case 2:
        return speedValidation.valid;
      case 3:
        return costValidation.valid;
      case 4:
        return modemRoomValidation.valid;
      case 5:
        return additionalRooms.length > 0;
      default:
        return false;
    }
  }, [step, ispValidation, speedValidation, costValidation, modemRoomValidation, additionalRooms]);

  const progressPercent = Math.round((step / stepsTotal) * 100);

  // Submit setup data to API
  const submitSetup = async () => {
    if (!sessionId) {
      setSubmitError('Session not initialized. Please refresh the page.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = {
        sessionId,
        isp,
        planDownloadMbps: downloadSpeed,
        monthlyCostNzd: cost,
      };

      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit setup');
      }

      // Success: navigate to test page
      router.push('/test');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSubmitError(errorMsg);
      setSubmitRetryCount((prev) => prev + 1);

      // Auto-retry logic (max 3 retries with exponential backoff)
      if (submitRetryCount < 2) {
        const delayMs = Math.pow(2, submitRetryCount) * 1000; // 1s, 2s, 4s
        setTimeout(submitSetup, delayMs);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!isStepValid()) return;

    if (step < stepsTotal) {
      setStep(step + 1);
      setSubmitError(null);
    } else {
      // Final step: submit setup and navigate to test page
      await submitSetup();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid() && !isSubmitting) {
      handleNext();
    }
  };

  const inputBase =
    'w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:-m-0 [&::-webkit-inner-spin-button]:-m-0';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/page3-background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          onError={() => {
            /* ignore error; gradient shows */
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-gray-900 to-blue-900" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-300">
            Step {step} of {stepsTotal}
          </div>
        </div>

        {/* Privacy & Purpose Reassurance Block — Persistent */}
        <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-emerald-400 font-bold text-base">✓</span>
            <div>
              <p className="font-medium mb-1">Your data is private and never shared.</p>
              <p className="text-emerald-200/80 text-xs md:text-sm">We only use this to compare your real speeds to your plan and generate your personal WiFi report.</p>
            </div>
          </div>
        </div>

        {/* Session initialization or network error message */}
        {submitError && (
          <div className="mb-6">
            <ValidationMessage
              type="error"
              message={`Network error: ${submitError}${submitRetryCount > 0 ? ` (Retry attempt ${submitRetryCount})` : ''}`}
            />
          </div>
        )}

        {!sessionId && !submitError && (
          <div className="mb-6">
            <ValidationMessage
              type="info"
              message="Initializing your session..."
            />
          </div>
        )}

        {/* Card */}
        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {/* Step 1: ISP */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Who is your ISP?
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  Select from popular NZ providers or enter your own
                </p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
                  <span className="font-medium text-blue-300">Why we ask:</span> Your ISP helps us understand typical plan structures and compare your real speeds to expectations.
                </p>

                <Autocomplete
                  value={isp}
                  onChange={handleIspChange}
                  onSuggestionSelect={handleIspSelect}
                  suggestions={ispSuggestions}
                  placeholder="e.g. Spark, Vodafone, 2degrees"
                  inputClassName={inputBase}
                  onKeyDown={handleKeyPress}
                />

                {!ispValidation.valid && (
                  <ValidationMessage
                    type="error"
                    message={ispValidation.error || 'Invalid ISP name'}
                  />
                )}

                {ispValidation.valid && isp && (
                  <ValidationMessage
                    type="success"
                    message="Great"
                  />
                )}
              </motion.div>
            )}

            {/* Step 2: Download Speed */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  What&apos;s your download speed?
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  Enter the speed you&apos;re paying for (not tested yet)
                </p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
                  <span className="font-medium text-blue-300">Why we ask:</span> This helps us identify if you&apos;re actually getting the speeds you pay for.
                </p>

                <div className="relative mb-4">
                  <input
                    inputMode="numeric"
                    type="number"
                    className={inputBase}
                    placeholder="e.g. 100 Mbps (download speed)"
                    value={downloadSpeed ?? ''}
                    onChange={(e) => handleSpeedChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    min="1"
                    max="1000"
                  />
                  {downloadSpeed !== null && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 text-sm font-medium pointer-events-none">
                      {formatSpeed(downloadSpeed)}
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400 p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 mb-4">
                  Don&apos;t know your speed? <span className="text-amber-300 font-medium">Check your bill or router</span>, or look it up with your ISP name online.
                </div>

                {!speedValidation.valid && (
                  <ValidationMessage
                    type="error"
                    message={speedValidation.error || 'Invalid speed'}
                  />
                )}

                {speedValidation.warning && (
                  <ValidationMessage
                    type="warning"
                    message={speedValidation.warning}
                  />
                )}

                {speedValidation.valid && downloadSpeed !== null && (
                  <ValidationMessage
                    type="success"
                    message="Great"
                  />
                )}
              </motion.div>
            )}

            {/* Step 3: Cost */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  How much do you pay per month?
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  Include GST — this helps us compare value
                </p>
                <p className="text-gray-500 text-xs md:text-sm mb-2 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
                  <span className="font-medium text-blue-300">Why we ask:</span> We calculate value for money and spot mismatches between plan price and performance.
                </p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
                  <span className="font-medium text-emerald-300">Your privacy:</span> This stays private and is never shared. See our privacy policy for details.
                </p>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    NZ$
                  </span>
                  <input
                    inputMode="decimal"
                    type="number"
                    step="0.01"
                    className={`${inputBase} pl-12`}
                    placeholder="e.g. 89.00 (monthly cost)"
                    value={cost ?? ''}
                    onChange={(e) => handleCostChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    min="0"
                    max="500"
                  />
                  {cost !== null && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 text-sm font-medium pointer-events-none">
                      (incl. GST)
                    </div>
                  )}
                </div>

                {!costValidation.valid && (
                  <ValidationMessage
                    type="error"
                    message={costValidation.error || 'Invalid cost'}
                  />
                )}

                {costValidation.warning && (
                  <ValidationMessage
                    type="warning"
                    message={costValidation.warning}
                  />
                )}

                {costValidation.valid && cost !== null && (
                  <ValidationMessage
                    type="success"
                    message="Great"
                  />
                )}
              </motion.div>
            )}

            {/* Step 4: Modem Room */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Where is your modem located?
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  This is your baseline for comparison
                </p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
                  <span className="font-medium text-blue-300">Why it matters:</span> Your modem location defines the starting point of your home signal path—everything else is compared to this.
                </p>

                <Autocomplete
                  value={modemRoom}
                  onChange={handleModemRoomChange}
                  onSuggestionSelect={handleModemRoomSelect}
                  suggestions={getSuggestedRooms(modemRoom)}
                  placeholder="e.g. Living Room, Study"
                  inputClassName={inputBase}
                />

                {!modemRoomValidation.valid && (
                  <ValidationMessage
                    type="error"
                    message={modemRoomValidation.error || 'Invalid room name'}
                  />
                )}

                {modemRoomValidation.valid && modemRoom && (
                  <ValidationMessage
                    type="success"
                    message={`Room added: ${modemRoom}`}
                  />
                )}
              </motion.div>
            )}

            {/* Step 5: Additional Rooms */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Add additional rooms to test
                </h2>
                <p className="text-gray-400 text-sm mb-3">
                  Compare WiFi strength across your home
                </p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
                  <span className="font-medium text-blue-300">Here's what happens:</span> We&apos;ll test each room so you can see where your WiFi is strongest—and where it struggles. You'll get a clear room-by-room map.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Autocomplete
                    value={roomInput}
                    onChange={handleRoomInputChange}
                    suggestions={roomSuggestions}
                    placeholder="e.g. Bedroom, Garage"
                    inputClassName={inputBase}
                  />
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    disabled={!roomInputValidation.valid || !roomInput.trim()}
                    className="h-12 whitespace-nowrap rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 transition font-medium text-sm md:text-base focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    aria-label="Add room to test list"
                  >
                    Add Room
                  </button>
                </div>

                {!roomInputValidation.valid && roomInput && (
                  <ValidationMessage
                    type="error"
                    message={
                      roomInputValidation.error || 'Invalid room name'
                    }
                  />
                )}

                {/* Added Rooms List */}
                {additionalRooms.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-300 mb-3 font-medium">
                      Rooms to test ({additionalRooms.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {additionalRooms.map((room) => (
                        <div
                          key={room}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
                        >
                          <span className="text-sm">{room}</span>
                          <button
                            onClick={() => handleRemoveRoom(room)}
                            className="ml-1 hover:text-cyan-100 transition"
                            aria-label={`Remove ${room}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {additionalRooms.length === 0 && (
                  <ValidationMessage
                    type="info"
                    message="Add at least one room to continue"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1 || isSubmitting}
              className="h-12 px-4 md:px-6 py-2 text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition rounded-lg hover:bg-white/5 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              aria-label="Go to previous step"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || isSubmitting || !sessionId}
              className={`h-12 rounded-full px-8 py-3 font-semibold text-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:outline-none ${
                step === stepsTotal
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800 focus:ring-green-400'
                  : 'bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-700 focus:ring-cyan-400'
              }`}
              aria-label={step === stepsTotal ? 'Begin WiFi speed test' : 'Go to next step'}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : step === stepsTotal ? (
                'Begin Testing'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
