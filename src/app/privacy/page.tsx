'use client';

import { useRouter } from 'next/navigation';
import { MdSecurity, MdArrowBack } from 'react-icons/md';

export default function PrivacyPage() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const sections = [
    {
      title: 'Introduction',
      content: 'WiFiFly ("we", "us", "our", or "Company") operates the WiFiFly application ("Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. We are committed to protecting your privacy and ensuring you have a positive experience on our platform.'
    },
    {
      title: 'Information Collection and Use',
      content: 'We collect information for various purposes to provide and improve our Service to you:\n\n• Test Results: Download speed, upload speed, ping, and jitter measurements from your WiFi network\n• Location Data: Room names and locations where you conduct speed tests\n• Personal Information: Your ISP provider name and monthly plan cost (for speed comparison analysis)\n• Device Information: IP address, browser type, and device characteristics\n• Usage Data: How you interact with our Service and testing patterns'
    },
    {
      title: 'Data Security',
      content: 'The security of your data is important to us but remember that no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. Your test results are encrypted during transmission and are stored securely on our servers.'
    },
    {
      title: 'Data Retention',
      content: 'WiFiFly will retain your test data for as long as your account is active or as needed to provide you with our Services. You may request deletion of your data at any time by contacting us. Upon deletion, your historical test results will be permanently removed from our systems.'
    },
    {
      title: 'Third-Party Service Providers',
      content: 'We may employ third-party companies and individuals to facilitate our Service ("Service Providers"). These parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. Our Service Providers are located primarily in New Zealand and comply with local and international data protection regulations.'
    },
    {
      title: 'Children\'s Privacy',
      content: 'Our Service is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we become aware that a child under 13 has provided us with personal information, we immediately delete such information from our servers.'
    },
    {
      title: 'Your Rights',
      content: 'Under the Privacy Act 2020 (New Zealand), you have the right to:\n\n• Access your personal information\n• Request correction of inaccurate data\n• Request deletion of your data\n• Opt out of marketing communications\n• Request information about how your data is used\n\nTo exercise any of these rights, please contact us using the information provided on our Contact Us page.'
    },
    {
      title: 'Changes to This Privacy Policy',
      content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.'
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions about this Privacy Policy, please contact us at hello@wififly.nz or visit our Contact Us page. We are committed to working with you to obtain a fair resolution of any privacy concerns.'
    }
  ];

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden pb-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/50">
              <MdSecurity className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
          <p className="text-gray-300 text-sm">
            Effective Date: November 12, 2025
          </p>
        </div>

        {/* Privacy Content */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-cyan-500 rounded" />
                {section.title}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Return to previous page */}
        <div className="text-center mt-12">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <MdArrowBack className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
