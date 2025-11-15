import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Landing() {
  const [loading, setLoading] = React.useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await api.analytics.log('landing_cta_clicked');
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-content container">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-5xl font-bold mb-6 text-blue-600">WiFiFly</h1>
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">
            Is Your WiFi Delivering?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get a free, personalized WiFi speed test and improvement plan. 
            Test each room in your home to see where your connection is strongest 
            and where it struggles most.
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-2xl">✓</div>
              <div className="text-left">
                <p className="font-semibold">Multi-Room Testing</p>
                <p className="text-gray-600">Test your WiFi in every room</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-2xl">✓</div>
              <div className="text-left">
                <p className="font-semibold">Free Personalized Plan</p>
                <p className="text-gray-600">Get specific recommendations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-2xl">✓</div>
              <div className="text-left">
                <p className="font-semibold">No Installation Required</p>
                <p className="text-gray-600">Test directly in your browser</p>
              </div>
            </div>
          </div>

          <Link href="/struggle">
            <button
              className="btn-primary text-lg px-8 py-3"
              onClick={handleGetStarted}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Check My WiFi'}
            </button>
          </Link>

          <p className="text-gray-500 text-sm mt-8">
            Takes about 5 minutes • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
