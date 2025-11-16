'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HelpCircle, Upload, CheckCircle, AlertCircle, Download, Zap, TrendingUp } from 'lucide-react';
import { useSetupStore } from '@/store/setupStore';
import type { RoomTestResult } from '@/types/librespeed';

// Sanity check threshold for impossible speeds (home internet maxes at ~1000 Mbps)
const UI_THRESHOLD = 1000;

interface AnalysisData {
  room: string;
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
  dlPercent: number;
  dlDisplay: number; // Capped for display
  dlRaw: number; // Original value
  hasAnomaly: boolean;
}

interface RoomVerdictProps {
  room: string;
  dl: number;
  dlPercent: number;
  worstDl: number;
  bestDl: number;
  hasAnomaly: boolean;
}

interface ImprovementPotential {
  room: string;
  confidence: 'Low' | 'Moderate' | 'High';
  estimatedUplift: string;
}

// Helper: Generate room verdict based on performance
function getRoomVerdict(dl: number, dlPercent: number, worstDl: number, bestDl: number, hasAnomaly: boolean): string {
  if (hasAnomaly) return 'Anomalous';

  // Five single-word tiers in 20% increments (0-19,20-39,40-59,60-79,80-100).
  if (dlPercent >= 80) return 'Excellent';
  if (dlPercent >= 60) return 'Good';
  if (dlPercent >= 40) return 'Fair';
  if (dlPercent >= 20) return 'Poor';
  return 'Terrible';
}

// Helper: Determine improvement confidence
function getImprovementConfidence(dl: number, variance: number): 'Low' | 'Moderate' | 'High' {
  if (variance > 50) return 'High'; // High variance = lots of room to improve
  if (variance > 25) return 'Moderate';
  return 'Low';
}

export default function AnalysisPage() {
  const router = useRouter();
  const { testResults, downloadSpeed, cost } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photoFile: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);

    if (testResults.length === 0) {
      router.push('/setup');
      return;
    }

    const ispPlanSpeed = downloadSpeed || 100;
    const processed = testResults
      .map((result: RoomTestResult) => {
        const rawDl = result.result.dl;
        const hasAnomaly = rawDl > UI_THRESHOLD;
        const displayDl = Math.min(rawDl, UI_THRESHOLD);
        
        return {
          room: result.room,
          dl: displayDl,
          ul: result.result.ul,
          ping: result.result.ping,
          jitter: result.result.jitter,
          dlPercent: Math.round((displayDl / ispPlanSpeed) * 100),
          dlDisplay: displayDl,
          dlRaw: rawDl,
          hasAnomaly,
        };
      })
      .sort((a, b) => b.dl - a.dl);

    setAnalysisData(processed);
    
    // Log anomalies for analytics
    const anomalyCount = processed.filter(p => p.hasAnomaly).length;
    if (anomalyCount > 0) {
      console.warn(`[Analysis] Anomaly detected in ${anomalyCount} room(s) — speeds > ${UI_THRESHOLD} Mbps capped for display`);
    }
  }, [testResults, downloadSpeed, router]);

  if (!mounted || analysisData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-linear-to-br from-gray-900 via-blue-900 to-gray-900">
        <p>Loading analysis...</p>
      </div>
    );
  }

  // Calculate statistics
  const avgDL = Math.round(analysisData.reduce((sum, d) => sum + d.dl, 0) / analysisData.length);
  const bestRoom = analysisData[0];
  const worstRoom = analysisData[analysisData.length - 1];
  const ispPlanSpeed = downloadSpeed || 100;
  const variance = bestRoom.dl - worstRoom.dl;
  const hasAnomalies = analysisData.some(d => d.hasAnomaly);

  // Prepare graph data
  const dlData = [...analysisData].sort((a, b) => b.dl - a.dl);
  const ulData = [...analysisData].sort((a, b) => b.ul - a.ul);
  const pingData = [...analysisData].sort((a, b) => a.ping - b.ping);
  const jitterData = [...analysisData].sort((a, b) => a.jitter - b.jitter);

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, photoFile: e.target.files![0] }));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in name and email');
      return;
    }
    
    if (!formData.email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare form data with file upload if present
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      
      if (formData.photoFile) {
        submitData.append('photo', formData.photoFile);
      }

      // Get session ID from localStorage
      const sessionId = localStorage.getItem('wififly_sessionId') || '';

      // Submit to new submissions endpoint
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: submitData,
        headers: {
          'X-Session-ID': sessionId,
        },
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const MetricsEducationSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {[
        {
          label: 'Download Speed',
          icon: <Download className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'How fast data comes to you. Needed for streaming, browsing, gaming.',
        },
        {
          label: 'Upload Speed',
          icon: <Upload className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'How fast data leaves you. Needed for video calls and file uploads.',
        },
        {
          label: 'Ping (Latency)',
          icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'How fast you ping the server. Lower is better for gaming & calls.',
        },
        {
          label: 'Jitter',
          icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'Ping consistency. Stable (low) is better for smooth experience.',
        },
      ].map((metric) => (
        <div
          key={metric.label}
          className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all group cursor-help"
          title={metric.help}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="text-cyan-400 group-hover:text-cyan-300">{metric.icon}</div>
            <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
              {metric.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{metric.help}</p>
        </div>
      ))}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 sm:p-6 pb-20">
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ===== A. HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Your WiFi Network Analysis</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Test completed on {new Date().toLocaleDateString()} • {analysisData.length} rooms tested
          </p>
        </motion.div>

        {/* ===== B. YOUR SPEED VS YOUR PLAN (FACTS-FIRST) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Speed vs Your Plan</h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Your plan advertises <strong>{ispPlanSpeed} Mbps</strong> download. Across the {analysisData.length} rooms we tested, your average download is <strong>{avgDL} Mbps</strong>, which is <strong>{Math.round((avgDL / ispPlanSpeed) * 100)}%</strong> of the advertised speed. Your best room measured <strong>{bestRoom.dl} Mbps</strong> and your weakest room measured <strong>{worstRoom.dl} Mbps</strong>.
            </p>
            {hasAnomalies && (
              <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Some test values look unusual — visuals have been adjusted for clarity. If numbers look incorrect, contact support for a deeper check.</span>
                </p>
              </div>
            )}
          </div>

          {/* Room summary cards (concise factual view) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisData.map((room) => (
              <motion.div
                key={room.room}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm sm:text-base">{room.room}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    room.dlPercent >= 80 ? 'bg-green-500/30 text-green-300' :
                    room.dlPercent >= 60 ? 'bg-teal-500/30 text-teal-300' :
                    room.dlPercent >= 40 ? 'bg-yellow-500/30 text-yellow-300' :
                    room.dlPercent >= 20 ? 'bg-orange-500/30 text-orange-300' :
                    'bg-red-600/30 text-red-300'
                  }`}>
                    {room.dlPercent >= 80 ? 'Excellent' : room.dlPercent >= 60 ? 'Good' : room.dlPercent >= 40 ? 'Fair' : room.dlPercent >= 20 ? 'Poor' : 'Terrible'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mb-3">
                  {room.dlDisplay} Mbps • {room.dlPercent}% of plan
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* NOTE: Removed generic "What This Means" and "Improvement Potential" sections in Phase 1.
            Those narrative/diagnostic sections will be replaced with a concise facts-first flow
            and a soft CTA to request deeper analysis. */}

        {/* ===== F. VISUALS (TOGGLE SIMPLE/DETAILED) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Performance Metrics</h2>
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="text-sm px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors border border-white/20"
            >
              {showDetailedView ? 'Simple View' : 'Detailed View'}
            </button>
          </div>

          {/* Waterfall - Always visible */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">How Your Speed Compares to Your Plan</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Your ISP Plan: {ispPlanSpeed} Mbps {hasAnomalies && '(visuals may be adjusted due to unusual test values)'}
              </p>
            </div>
            <div className="space-y-4">
              {/* Plan baseline */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="w-32 text-xs sm:text-sm font-medium shrink-0">Your ISP Plan:</div>
                <div className="flex-1">
                  <div className="h-6 sm:h-8 bg-cyan-500 rounded-lg flex items-center justify-end pr-3">
                    <span className="text-white font-bold text-xs sm:text-sm">{ispPlanSpeed} Mbps (100%)</span>
                  </div>
                </div>
              </div>

              {/* Room bars */}
              {analysisData.map((item) => {
                const displayPercent = Math.min(item.dlPercent, 100);
                const barWidth = Math.min(item.dlPercent, 100);
                return (
                  <div key={item.room} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="w-32 text-xs sm:text-sm font-medium shrink-0">{item.room}:</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700/50 rounded-lg h-6 sm:h-8 overflow-hidden">
                          <motion.div
                            className="h-full bg-cyan-500 rounded-lg flex items-center justify-end pr-2 sm:pr-3"
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          >
                            {displayPercent > 15 && (
                              <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
                                {displayPercent}%{item.hasAnomaly ? '*' : ''}
                              </span>
                            )}
                          </motion.div>
                        </div>
                        {displayPercent <= 15 && (
                          <span className="text-cyan-400 font-bold text-xs sm:text-sm shrink-0">
                            {displayPercent}%{item.hasAnomaly ? '*' : ''}
                          </span>
                        )}
                      </div>
                      {item.hasAnomaly && (
                        <p className="text-xs text-yellow-300 mt-1">* Unusual value detected — showing adjusted result</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-white/10">
              Bars are capped at 100% for readability. Rooms exceeding plan show percentage above 100%.
            </p>
          </div>

          {/* Graphs - Conditional on showDetailedView */}
          {showDetailedView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 mt-8"
            >
              {/* Download Speed Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Download Speed</h2>
                  <p className="text-gray-300 text-sm">
                    How fast you can pull content from the internet
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dlData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="room"
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.6)" label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,217,255,0.5)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} Mbps`, 'Download']}
                    />
                    <Line
                      type="monotone"
                      dataKey="dl"
                      stroke="#00D9FF"
                      strokeWidth={3}
                      dot={{ fill: '#00D9FF', r: 6 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Upload Speed Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Upload Speed</h2>
                  <p className="text-gray-300 text-sm">
                    How fast you can send content to the internet
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={ulData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="room"
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.6)" label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,217,255,0.5)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} Mbps`, 'Upload']}
                    />
                    <Line
                      type="monotone"
                      dataKey="ul"
                      stroke="#00B8D4"
                      strokeWidth={3}
                      dot={{ fill: '#00B8D4', r: 6 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Ping Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Ping (Latency)</h2>
                  <p className="text-gray-300 text-sm">
                    How fast your connection responds (lower is better)
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={pingData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="room"
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.6)" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,217,255,0.5)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} ms`, 'Ping']}
                    />
                    <Line
                      type="monotone"
                      dataKey="ping"
                      stroke="#20C997"
                      strokeWidth={3}
                      dot={{ fill: '#20C997', r: 6 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Jitter Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Jitter (Stability)</h2>
                  <p className="text-gray-300 text-sm">
                    How stable your connection is (lower is better)
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={jitterData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="room"
                      stroke="rgba(255,255,255,0.6)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.6)" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0,217,255,0.5)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} ms`, 'Jitter']}
                    />
                    <Line
                      type="monotone"
                      dataKey="jitter"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', r: 6 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ===== G. DETAILED RESULTS TABLE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 mb-8 overflow-x-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4">All Test Results</h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-4">Raw data from your speed tests across all rooms:</p>
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold">Room</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">Download</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">Upload</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">Ping</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">Jitter</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item) => (
                <tr key={item.room} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">{item.room}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{item.dl} Mbps {item.hasAnomaly && <span className="text-yellow-300">*</span>}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{item.ul} Mbps</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{item.ping} ms</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{item.jitter} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasAnomalies && (
            <p className="text-xs text-yellow-300 mt-3 pt-3 border-t border-white/10">
              * Unusual values detected — these rooms had test anomalies and speeds are capped at {UI_THRESHOLD} Mbps for display
            </p>
          )}
        </motion.div>

        {/* ===== H. SOFT CTA: WANT TO KNOW WHY? ===== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/6 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Want to know what's causing low speeds?</h3>
              <p className="text-sm text-gray-300">We show the facts here — if you'd like a deeper diagnosis (equipment, setup, wiring or ISP), our team can investigate.</p>
            </div>
            <div className="sm:shrink-0">
              <a href="#contact-form" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium">Get Help Understanding Your Results</a>
            </div>
          </div>
        </motion.div>

        {/* ===== H. PERSONALISED IMPROVEMENT CTA FORM ===== */}
        <motion.div id="contact-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-linear-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Get Help Understanding Your Results</h2>
            <p className="text-sm text-gray-300">
              If you'd like us to investigate further and explain what's causing your speeds, share a few details and our team will help diagnose the issue.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              </div>
              <h3 className="text-lg font-bold mb-2">Thanks! Your plan is coming.</h3>
              <p className="text-sm text-gray-400">
                We'll email you a custom WiFi upgrade recommendation based on your results and home setup.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Back to Results
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                // Simulate form submission
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSubmitted(true);
                setSubmitting(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Alex"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Modem Photo (Optional)</label>
                <button
                  type="button"
                  onClick={handlePhotoCapture}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-cyan-400 hover:border-cyan-500 transition"
                >
                  {formData.photoFile ? `📷 ${formData.photoFile.name}` : '📷 Upload Modem Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
              >
                {submitting ? 'Sending...' : 'Get Expert Help →'}
              </button>
            </form>
          )}
        </motion.div>

        {/* ===== I. EDUCATIONAL SIDEBAR / INLINE HELP ===== */}
        <MetricsEducationSection />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            Common WiFi Questions
          </h2>
          <div className="space-y-4 text-sm">
            <details className="group">
              <summary className="cursor-pointer font-medium hover:text-cyan-400 transition">
                Why is my speed slower in some rooms?
              </summary>
              <p className="text-gray-400 mt-2 ml-4 text-xs sm:text-sm">
                WiFi weakens as you get farther from the router and through walls/obstacles. Placement matters more than modem power. Speeds around 5–10 Mbps will still support basic browsing and email, but may struggle with HD video, large downloads, or multiple active devices.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium hover:text-cyan-400 transition">
                What's a "good" ping for gaming?
              </summary>
              <p className="text-gray-400 mt-2 ml-4 text-xs sm:text-sm">
                Below 50ms is excellent, 50–100ms is good, above 100ms can cause lag. Your ping is: {analysisData[0]?.ping || 'N/A'} ms
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium hover:text-cyan-400 transition">
                Should I upgrade my ISP plan or fix my WiFi?
              </summary>
              <p className="text-gray-400 mt-2 ml-4 text-xs sm:text-sm">
                If you're getting 70%+ of your plan speed in most rooms, your WiFi placement is the issue. Adding a mesh node costs less than upgrading your plan.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium hover:text-cyan-400 transition">
                What's the best placement for a modem?
              </summary>
              <p className="text-gray-400 mt-2 ml-4 text-xs sm:text-sm">
                Central, high up, away from water/metal, and away from microwaves. Try moving your modem and re-test in a few days.
              </p>
            </details>
          </div>
        </motion.div>

        {/* ===== J. FOOTER ACTIONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-8 pb-12"
        >
          <button
            onClick={() => window.print()}
            className="text-sm sm:text-base px-6 sm:px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
          >
            📋 Print Report
          </button>
          <button
            onClick={() => {
              // Copy results to clipboard
              const summary = `WiFi Speed Test Results\n\nAverage Download: ${avgDL} Mbps\nBest Room: ${bestRoom.room} (${bestRoom.dl} Mbps)\nWeakest Room: ${worstRoom.room} (${worstRoom.dl} Mbps)\n\nShare with: WiFiFly`;
              navigator.clipboard.writeText(summary);
              alert('Results copied to clipboard!');
            }}
            className="text-sm sm:text-base px-6 sm:px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
          >
            📤 Share Results
          </button>
          <button
            onClick={() => router.push('/test')}
            className="text-sm sm:text-base px-6 sm:px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-colors font-semibold"
          >
            🔄 Test Again
          </button>
        </motion.div>

        {/* Removed duplicated graphs and plan-investment block to keep facts-first flow and reduce page weight. */}
      </div>
    </div>
  );
}
