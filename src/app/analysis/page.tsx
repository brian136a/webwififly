'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSetupStore } from '@/store/setupStore';
import type { RoomTestResult } from '@/types/librespeed';

interface AnalysisData {
  room: string;
  dl: number;
  ul: number;
  ping: number;
  jitter: number;
  dlPercent: number;
}

export default function AnalysisPage() {
  const router = useRouter();
  const { testResults, downloadSpeed, cost } = useSetupStore();
  const [mounted, setMounted] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);

  useEffect(() => {
    setMounted(true);

    // Redirect if no test results
    if (testResults.length === 0) {
      router.push('/setup');
      return;
    }

    // Process data for analysis
    const ispPlanSpeed = downloadSpeed || 100; // Default to 100 if not set
    const processed = testResults
      .map((result: RoomTestResult) => ({
        room: result.room,
        dl: Math.round(result.result.dl),
        ul: Math.round(result.result.ul),
        ping: result.result.ping,
        jitter: result.result.jitter,
        dlPercent: Math.round((result.result.dl / ispPlanSpeed) * 100),
      }))
      .sort((a, b) => b.dl - a.dl); // Sort by download speed

    setAnalysisData(processed);
  }, [testResults, downloadSpeed, router]);

  if (!mounted || analysisData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading analysis...</p>
      </div>
    );
  }

  // Calculate statistics
  const avgDL = Math.round(
    analysisData.reduce((sum, d) => sum + d.dl, 0) / analysisData.length
  );
  const bestRoom = analysisData[0];
  const worstRoom = analysisData[analysisData.length - 1];
  const ispPlanSpeed = downloadSpeed || 100;
  const monthlyMargin = analysisData.length > 0 ? (cost || 0) / analysisData.length : 0;

  // Prepare graph data (sorted for each metric)
  const dlData = [...analysisData].sort((a, b) => b.dl - a.dl);
  const ulData = [...analysisData].sort((a, b) => b.ul - a.ul);
  const pingData = [...analysisData].sort((a, b) => a.ping - b.ping);
  const jitterData = [...analysisData].sort((a, b) => a.jitter - b.jitter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6 pb-20">
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Your WiFi Network Analysis</h1>
          <p className="text-gray-300 text-lg">
            Test completed on {new Date().toLocaleDateString()} • {analysisData.length} rooms tested
          </p>
        </motion.div>

        {/* Performance Graphs Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-12 mb-12"
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
              <h2 className="text-2xl font-bold mb-2">Ping (Response Time)</h2>
              <p className="text-gray-300 text-sm">
                How quickly your device talks to the internet (lower is better)
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

        {/* Signal Delivery Waterfall */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">How Your Speed Compares to Your Plan</h2>
            <p className="text-gray-300 text-sm">
              Your ISP Plan: {ispPlanSpeed} Mbps
            </p>
          </div>
          <div className="space-y-4">
            {/* Plan baseline */}
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Your ISP Plan:</div>
              <div className="flex-1">
                <div className="h-8 bg-cyan-500 rounded-lg flex items-center justify-end pr-3">
                  <span className="text-white font-bold text-sm">{ispPlanSpeed} Mbps (100%)</span>
                </div>
              </div>
            </div>

            {/* Room bars */}
            {analysisData.map((item) => (
              <div key={item.room} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{item.room}:</div>
                <div className="flex-1">
                  <div
                    className="h-8 bg-cyan-500 rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${item.dlPercent}%` }}
                  >
                    {item.dlPercent > 15 && (
                      <span className="text-white font-bold text-sm whitespace-nowrap">
                        {item.dlPercent}% ({item.dl} Mbps)
                      </span>
                    )}
                  </div>
                  {item.dlPercent <= 15 && (
                    <span className="text-cyan-400 font-bold text-sm ml-2">
                      {item.dlPercent}% ({item.dl} Mbps)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan Investment Analysis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Your Plan Investment</h2>

          {/* Plan Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-white/20">
            <div>
              <p className="text-gray-400 text-sm mb-1">Monthly Cost</p>
              <p className="text-3xl font-bold text-cyan-400">${cost?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Advertised Download</p>
              <p className="text-3xl font-bold text-cyan-400">{ispPlanSpeed} Mbps</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Average Actual</p>
              <p className="text-3xl font-bold text-cyan-400">{avgDL} Mbps</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">% of Plan</p>
              <p className="text-3xl font-bold text-cyan-400">{Math.round((avgDL / ispPlanSpeed) * 100)}%</p>
            </div>
          </div>

          {/* Reality Check */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Reality Check</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="font-medium">Best room ({bestRoom.room}):</span> {bestRoom.dl} Mbps ({bestRoom.dlPercent}% of plan)
              </p>
              <p>
                <span className="font-medium">Weakest room ({worstRoom.room}):</span> {worstRoom.dl} Mbps ({worstRoom.dlPercent}% of plan)
              </p>
              <p>
                <span className="font-medium">Average across all rooms:</span> {avgDL} Mbps ({Math.round((avgDL / ispPlanSpeed) * 100)}% of plan)
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown by Room</h3>
            <p className="text-gray-400 text-sm mb-4">
              If your monthly cost was divided equally across {analysisData.length} rooms: ${monthlyMargin.toFixed(2)}/month per room
            </p>
            <div className="space-y-2">
              {analysisData.map((item) => {
                const value = monthlyMargin * (item.dl / ispPlanSpeed);
                const difference = monthlyMargin - value;
                return (
                  <div key={item.room} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.room}:</span>
                    <div className="text-right">
                      <p className="text-gray-300">
                        Getting ~${value.toFixed(2)}/month worth
                      </p>
                      {difference > 0 && (
                        <p className="text-yellow-400 text-xs">
                          Variance: ${difference.toFixed(2)}/month
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Data Reference Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12 overflow-x-auto"
        >
          <h2 className="text-2xl font-bold mb-6">Detailed Results</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 font-semibold">Room</th>
                <th className="text-right py-3 px-4 font-semibold">Download</th>
                <th className="text-right py-3 px-4 font-semibold">Upload</th>
                <th className="text-right py-3 px-4 font-semibold">Ping</th>
                <th className="text-right py-3 px-4 font-semibold">Jitter</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item) => (
                <tr key={item.room} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-medium">{item.room}</td>
                  <td className="text-right py-3 px-4">{item.dl} Mbps</td>
                  <td className="text-right py-3 px-4">{item.ul} Mbps</td>
                  <td className="text-right py-3 px-4">{item.ping} ms</td>
                  <td className="text-right py-3 px-4">{item.jitter} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Explanations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">What Each Measurement Means</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">Download Speed</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                How fast you can pull files from the internet. Measured in Mbps (megabits per second).
                Used for watching videos, downloading files, and web browsing.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">Upload Speed</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                How fast you can send files to the internet. Measured in Mbps (megabits per second).
                Used for video calls, uploading photos, and streaming content.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">Ping (Response Time)</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                How long it takes your device to talk to the internet and get an answer back.
                Measured in milliseconds (ms). Used for gaming and video calls (lower is better).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">Jitter (Stability)</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                How much your response time varies. Measured in milliseconds (ms).
                Used for smooth video calls and gaming (lower is better).
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4 pt-8"
        >
          <button
            onClick={() => window.print()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Print Report
          </button>
          <button
            onClick={() => router.push('/setup')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Start New Test
          </button>
        </motion.div>
      </div>
    </div>
  );
}
