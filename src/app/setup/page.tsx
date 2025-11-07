'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useSetupStore } from '@/store/setupStore';

const stepsTotal = 5;

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [roomInput, setRoomInput] = useState('');

  // REMOVED THE GUARD - This was causing the redirect issue
  // useEffect(() => {
  //   const referrer = document.referrer;
  //   if (!referrer || (!referrer.includes('/struggle') && !referrer.includes('/setup'))) {
  //     router.replace('/');
  //   }
  // }, [router]);

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
  } = useSetupStore();

  const progressPercent = Math.round((step / stepsTotal) * 100);

  const next = () => {
    if (step < stepsTotal) setStep(step + 1);
    else router.push('/test');
  };

  const inputBase =
    'w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        {/* Preferred background image */}
        {/* If image not present, gradient fallback remains visible underneath */}
        {(
          <Image
            src="/images/page3-background.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
            onError={() => { /* ignore error; gradient shows */ }}
          />
        )}
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
          <div className="mt-2 text-sm text-gray-300">Step {step} of {stepsTotal}</div>
        </div>

        {/* Card */}
        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Who is your ISP?</h2>
                <input
                  type="text"
                  className={inputBase}
                  placeholder="e.g. Spark, Vodafone, 2degrees"
                  value={isp}
                  onChange={(e) => setIsp(e.target.value)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">What&apos;s your download speed? (Mbps)</h2>
                <input
                  inputMode="numeric"
                  type="number"
                  className={inputBase}
                  placeholder="e.g. 100"
                  value={downloadSpeed ?? ''}
                  onChange={(e) => setDownloadSpeed(e.target.value === '' ? null : Number(e.target.value))}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">How much do you pay per month? (NZD)</h2>
                <input
                  inputMode="decimal"
                  type="number"
                  step="0.01"
                  className={inputBase}
                  placeholder="e.g. 89"
                  value={cost ?? ''}
                  onChange={(e) => setCost(e.target.value === '' ? null : Number(e.target.value))}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Where is your modem located?</h2>
                <input
                  type="text"
                  className={inputBase}
                  placeholder="e.g. Living room, Study"
                  value={modemRoom}
                  onChange={(e) => setModemRoom(e.target.value)}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={containerVariants}
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Add any additional rooms to check</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    className={inputBase}
                    placeholder="e.g. Bedroom, Garage"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = roomInput.trim();
                      if (trimmed) {
                        addAdditionalRoom(trimmed);
                        setRoomInput('');
                      }
                    }}
                    className="whitespace-nowrap rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 transition"
                  >
                    Add Room
                  </button>
                </div>

                {additionalRooms.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {additionalRooms.map((room, idx) => (
                      <li key={idx} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm">
                        {room}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={next}
              className={`rounded-full px-8 py-3 font-semibold text-white transition shadow-lg ${
                step === stepsTotal ? 'bg-green-600 hover:bg-green-700' : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              {step === stepsTotal ? 'Begin Testing' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}