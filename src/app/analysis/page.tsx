'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MdHelp, MdFileUpload, MdCheckCircle, MdError, MdDownload, MdBolt, MdTrendingUp } from 'react-icons/md';
import { useSetupStore } from '@/store/setupStore';
import type { RoomTestResult } from '@/types/librespeed';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

// Component A: Quick Diagnosis Teaser
function QuickDiagnosisTeaser() {
  const [isTeaserDismissed, setIsTeaserDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('advanced_teaser_dismissed_v1');
    if (dismissed) {
      setIsTeaserDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('advanced_teaser_dismissed_v1', 'true');
    setIsTeaserDismissed(true);
  };

  if (isTeaserDismissed) return null;

  return (
    <div className="bg-white/6 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-cyan-400 mt-1">ℹ️</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">What's Limiting Your Speed?</h3>
          <p className="text-sm text-gray-300 mb-4">
            This page shows <strong>WHAT</strong> you're getting. Our advanced analysis shows <strong>WHY</strong>.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Three common culprits: WiFi placement & interference • ISP line quality • Hardware age
          </p>
          <a href="#micro-form" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition">
            Show My Top 3 Bottlenecks → 
          </a>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Component B: Room Diagnostics Preview
interface RoomDiagnosticsPreviewProps {
  worstRoom: AnalysisData | null;
}

function RoomDiagnosticsPreview({ worstRoom }: RoomDiagnosticsPreviewProps) {
  if (!worstRoom) return null;

  return (
    <div className="bg-white/6 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-cyan-400 mb-1">Worst Room Diagnosis (Preview)</h3>
          <p className="text-sm text-gray-300">{worstRoom.room}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded p-3">
            <p className="text-xs text-gray-400">Download</p>
            <p className="text-lg font-bold">{worstRoom.dlDisplay} Mbps</p>
          </div>
          <div className="bg-white/5 rounded p-3">
            <p className="text-xs text-gray-400">% of Plan</p>
            <p className="text-lg font-bold">{worstRoom.dlPercent}%</p>
          </div>
          <div className="bg-white/5 rounded p-3">
            <p className="text-xs text-gray-400">Ping</p>
            <p className="text-lg font-bold">{worstRoom.ping}ms</p>
          </div>
          <div className="bg-white/5 rounded p-3">
            <p className="text-xs text-gray-400">Jitter</p>
            <p className="text-lg font-bold">{worstRoom.jitter}ms</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <p className="text-xs text-gray-500 mb-2">PRIMARY BOTTLENECK</p>
          <div className="bg-gray-900/50 rounded px-3 py-2 blur-sm inline-block">
            <p className="text-sm text-gray-500">[Requires Advanced Analysis]</p>
          </div>
          <p className="text-xs text-cyan-400 mt-2">See this detail free →</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <p className="text-xs text-gray-500 mb-2">RECOMMENDED FIX</p>
          <div className="bg-gray-900/50 rounded px-3 py-2 blur-sm inline-block">
            <p className="text-sm text-gray-500">[Requires Advanced Analysis]</p>
          </div>
          <p className="text-xs text-cyan-400 mt-2">Unlock for free →</p>
        </div>
      </div>

      <a
        href="#micro-form"
        className="inline-flex items-center gap-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors min-h-11"
      >
        Unlock My Free Advanced Diagnostics →
      </a>
    </div>
  );
}

// Component C: Costed Solutions Transparent
function CostedSolutionsTransparent() {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 sm:p-8">
        <h3 className="text-2xl font-bold mb-2">✅ Your Top 3 Bottlenecks Identified</h3>
        <p className="text-gray-300 mb-6">
          Check your email for the full diagnostic report. Here's your improvement roadmap:
        </p>

        {/* Improvement Roadmap */}
        <div className="space-y-4">
          {/* Step 1: Free */}
          <div className="bg-white/5 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-green-300">Step 1: Review Full Diagnostic Report</p>
                <p className="text-xs text-gray-400 mt-1">FREE • Check your email (arrive in next 5 min)</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 ml-11">Detailed analysis of your WiFi performance across all rooms with specific bottleneck identifications.</p>
          </div>

          {/* Step 2: Free */}
          <div className="bg-white/5 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-blue-500/20 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-blue-300">Step 2: Self-Fix Guide (No Cost)</p>
                <p className="text-xs text-gray-400 mt-1">FREE • Included in your diagnostic report</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 ml-11">Simple, actionable steps you can try right now: Restart modem, check WiFi channel, test wired connection, etc.</p>
            <div className="mt-3 ml-11 text-xs text-cyan-300">💡 Many users solve their issue with Step 2 alone.</div>
          </div>

          {/* Step 3: Optional/Costed */}
          <div className="bg-white/5 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-orange-500/20 text-orange-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-orange-300">Step 3: Professional Solutions (Optional)</p>
                <p className="text-xs text-gray-400 mt-1">COSTED • Only if you need hands-on help</p>
              </div>
            </div>
            <div className="space-y-3 ml-11 mt-3">
              <div className="bg-gray-900/50 rounded p-3 text-sm">
                <p className="font-medium mb-1">🛜 Mesh Node Upgrade</p>
                <p className="text-xs text-gray-400">$250-600 NZD • Recommended if your worst room is &gt;15m from router</p>
              </div>
              <div className="bg-gray-900/50 rounded p-3 text-sm">
                <p className="font-medium mb-1 flex items-center gap-2">
                  👨‍💻 Expert Consultation
                  <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded">Limited Availability</span>
                </p>
                <p className="text-xs text-gray-400">$80 • 1-hour video call with WiFi specialist to design custom solution</p>
              </div>
              <div className="bg-gray-900/50 rounded p-3 text-sm">
                <p className="font-medium mb-1">🔧 Professional Wiring Check</p>
                <p className="text-xs text-gray-400">$150 • Technician visit to inspect cables, placement, and interference</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-sm text-cyan-300">
            ℹ️ <strong>No hidden costs.</strong> All pricing is transparent upfront. Start with Steps 1 & 2 (both free) and decide if you want professional help.
          </p>
        </div>
      </div>
    </div>
  );
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
  });

  useEffect(() => {
    setMounted(true);

    if (testResults.length === 0) {
      router.push('/setup');
      return;
    }

    const ispPlanSpeed = downloadSpeed || 100;
    const processed = testResults
      .map((result: RoomTestResult) => {
        const rawDl = result.result?.dl ?? 0;
        const rawUl = result.result?.ul ?? 0;
        const rawPing = result.result?.ping ?? 0;
        const rawJitter = result.result?.jitter ?? 0;
        
        const hasAnomaly = rawDl > UI_THRESHOLD;
        const displayDl = Math.min(rawDl, UI_THRESHOLD);
        
        return {
          room: result.room || 'Unknown Room',
          dl: displayDl,
          ul: rawUl,
          ping: rawPing,
          jitter: rawJitter,
          dlPercent: ispPlanSpeed > 0 ? Math.round((displayDl / ispPlanSpeed) * 100) : 0,
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
      <div className="min-h-dvh flex items-center justify-center text-white bg-linear-to-br from-gray-900 via-blue-900 to-gray-900">
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

  const MetricsEducationSection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        {
          label: 'Download Speed',
          icon: <MdDownload className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'How fast data comes to you. Needed for streaming, browsing, gaming.',
        },
        {
          label: 'Upload Speed',
          icon: <MdFileUpload className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'How fast data leaves you. Needed for video calls and file uploads.',
        },
        {
          label: 'Ping (Latency)',
          icon: <MdBolt className="w-5 h-5 sm:w-6 sm:h-6" />,
          help: 'How fast you ping the server. Lower is better for gaming & calls.',
        },
        {
          label: 'Jitter',
          icon: <MdTrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
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
    </div>
  );

  return (
    <div className="min-h-dvh bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 sm:p-6 pb-20">
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ===== A. HEADER ===== */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Your WiFi Network Analysis</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Test completed on {new Date().toLocaleDateString()} • {analysisData.length} rooms tested
          </p>
        </div>

        {/* ===== B. YOUR SPEED VS YOUR PLAN (FACTS-FIRST) ===== */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Speed vs Your Plan</h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Your plan advertises <strong>{ispPlanSpeed} Mbps</strong> download. Across the {analysisData.length} rooms we tested, your average download is <strong>{avgDL} Mbps</strong>, which is <strong>{Math.round((avgDL / ispPlanSpeed) * 100)}%</strong> of the advertised speed. Your best room measured <strong>{bestRoom.dl} Mbps</strong> and your weakest room measured <strong>{worstRoom.dl} Mbps</strong>.
            </p>
            {hasAnomalies && (
              <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-300 flex items-start gap-2">
                  <MdError className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Some test values look unusual — visuals have been adjusted for clarity. If numbers look incorrect, contact support for a deeper check.</span>
                </p>
              </div>
            )}
          </div>

          {/* Room summary cards (concise factual view) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisData.map((room) => (
              <div
                key={room.room}
                className="bg-white/5 border border-white/10 rounded-lg p-4 transition-all hover:scale-105"
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
              </div>
            ))}
          </div>
        </div>

        {/* NOTE: Removed generic "What This Means" and "Improvement Potential" sections in Phase 1.
            Those narrative/diagnostic sections will be replaced with a concise facts-first flow
            and a soft CTA to request deeper analysis. */}

        {/* ===== F. VISUALS (TOGGLE SIMPLE/DETAILED) ===== */}
        <div className="mb-8">
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
                          <div
                            className="h-full bg-cyan-500 rounded-lg flex items-center justify-end pr-2 sm:pr-3 transition-all duration-1000"
                            style={{ width: `${barWidth}%` }}
                          >
                            {displayPercent > 15 && (
                              <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
                                {displayPercent}%{item.hasAnomaly ? '*' : ''}
                              </span>
                            )}
                          </div>
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
            <div className="space-y-8 mt-8">
              {/* Download Speed Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Download Speed</h2>
                  <p className="text-gray-300 text-sm">
                    How fast you can pull content from the internet
                  </p>
                </div>
                <div style={{ height: '300px' }}>
                  <Line
                    data={{
                      labels: dlData.map(d => d.room),
                      datasets: [{
                        label: 'Download Speed',
                        data: dlData.map(d => d.dl),
                        borderColor: '#00D9FF',
                        backgroundColor: '#00D9FF',
                        tension: 0.1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(0,217,255,0.5)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context) => `${context.parsed.y} Mbps`
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 12 } },
                          grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                          ticks: { color: 'rgba(255,255,255,0.6)' },
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          title: { display: true, text: 'Mbps', color: 'rgba(255,255,255,0.6)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Upload Speed Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Upload Speed</h2>
                  <p className="text-gray-300 text-sm">
                    How fast you can send content to the internet
                  </p>
                </div>
                <div style={{ height: '300px' }}>
                  <Line
                    data={{
                      labels: ulData.map(d => d.room),
                      datasets: [{
                        label: 'Upload Speed',
                        data: ulData.map(d => d.ul),
                        borderColor: '#00B8D4',
                        backgroundColor: '#00B8D4',
                        tension: 0.1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(0,217,255,0.5)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context) => `${context.parsed.y} Mbps`
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 12 } },
                          grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                          ticks: { color: 'rgba(255,255,255,0.6)' },
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          title: { display: true, text: 'Mbps', color: 'rgba(255,255,255,0.6)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Ping Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Ping (Latency)</h2>
                  <p className="text-gray-300 text-sm">
                    How fast your connection responds (lower is better)
                  </p>
                </div>
                <div style={{ height: '300px' }}>
                  <Line
                    data={{
                      labels: pingData.map(d => d.room),
                      datasets: [{
                        label: 'Ping',
                        data: pingData.map(d => d.ping),
                        borderColor: '#20C997',
                        backgroundColor: '#20C997',
                        tension: 0.1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(0,217,255,0.5)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context) => `${context.parsed.y} ms`
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 12 } },
                          grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                          ticks: { color: 'rgba(255,255,255,0.6)' },
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          title: { display: true, text: 'ms', color: 'rgba(255,255,255,0.6)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Jitter Graph */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Jitter (Stability)</h2>
                  <p className="text-gray-300 text-sm">
                    How stable your connection is (lower is better)
                  </p>
                </div>
                <div style={{ height: '300px' }}>
                  <Line
                    data={{
                      labels: jitterData.map(d => d.room),
                      datasets: [{
                        label: 'Jitter',
                        data: jitterData.map(d => d.jitter),
                        borderColor: '#8B5CF6',
                        backgroundColor: '#8B5CF6',
                        tension: 0.1,
                        pointRadius: 6,
                        pointHoverRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(0,217,255,0.5)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                            label: (context) => `${context.parsed.y} ms`
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 12 } },
                          grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                          ticks: { color: 'rgba(255,255,255,0.6)' },
                          grid: { color: 'rgba(255,255,255,0.1)' },
                          title: { display: true, text: 'ms', color: 'rgba(255,255,255,0.6)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== G. DETAILED RESULTS TABLE ===== */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 mb-8 overflow-x-auto">
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
        </div>

        {/* ===== G-PLUS. ROOM DIAGNOSTICS PREVIEW ===== */}
        <RoomDiagnosticsPreview worstRoom={worstRoom} />

        {/* ===== H. QUICK DIAGNOSIS TEASER ===== */}
        <QuickDiagnosisTeaser />

        {/* ===== I. SOFT CTA: WANT TO KNOW WHY? ===== */}
        <div className="bg-white/6 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Want to know what's causing low speeds?</h3>
              <p className="text-sm text-gray-300">This page shows your results. Our free advanced analysis tells you WHY.</p>
            </div>
            <div className="sm:shrink-0">
              <a href="#micro-form" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium min-h-11 flex items-center justify-center">Get My Bottlenecks →</a>
            </div>
          </div>
        </div>

        {/* ===== H. MICRO-COMMITMENT FORM ===== */}
        <div id="micro-form" className="mb-8">
          {submitted ? (
            <CostedSolutionsTransparent />
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Get Your Top 3 Speed Bottlenecks</h2>
                <p className="text-sm text-gray-300">
                  In 2 minutes, we'll email you the specific issues limiting your speed (+ free fixes to try yourself).
                </p>
              </div>

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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
                >
                  {submitting ? 'Sending...' : 'Email My Top 3 Speed Bottlenecks (FREE) →'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ===== I. EDUCATIONAL SIDEBAR / INLINE HELP ===== */}
        <MetricsEducationSection />

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <MdHelp className="w-5 h-5 text-cyan-400" />
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
        </div>

        {/* ===== J. FOOTER ACTIONS ===== */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 pb-12">
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
        </div>

        {/* Removed duplicated graphs and plan-investment block to keep facts-first flow and reduce page weight. */}
      </div>
    </div>
  );
}
