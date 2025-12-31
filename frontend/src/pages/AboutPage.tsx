import { BookOpen, Globe, Languages, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#09090b]">
      <div className="max-w-[1000px] mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="border-b border-gray-100 dark:border-[#27272A] pb-8">
          <p className="text-lg text-gray-600 dark:text-[#A1A1AA] max-w-2xl">
            Breaking language barriers with state-of-the-art AI technology.
            Open, accessible, and inclusive.
          </p>
        </div>

        {/* Mission Statement in a prominent feature card */}
        <div className="bg-black dark:bg-[#18181B] text-white p-8 rounded-xl shadow-lg relative overflow-hidden ring-1 ring-white/10">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed text-gray-200 dark:text-[#A1A1AA] max-w-3xl">
              Create a world without language barriers where everyone can communicate,
              learn, and share knowledge freely regardless of their native language.
            </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={120} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Global Reach */}
          <div className="border border-gray-200 dark:border-[#27272A] p-6 rounded-lg hover:border-gray-300 dark:hover:border-[#3F3F46] transition-colors bg-white dark:bg-[#18181B]">
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#27272A] rounded-lg flex items-center justify-center mb-4">
              <Globe className="text-gray-700 dark:text-[#E4E4E7]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Global Reach</h3>
            <p className="text-gray-600 dark:text-[#A1A1AA]">
              Supporting 200+ languages, including many underrepresented ones often overlooked by major providers.
            </p>
          </div>

          {/* Technology */}
          <div className="border border-gray-200 dark:border-[#27272A] p-6 rounded-lg hover:border-gray-300 dark:hover:border-[#3F3F46] transition-colors bg-white dark:bg-[#18181B]">
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#27272A] rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-gray-700 dark:text-[#E4E4E7]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Advanced AI</h3>
            <p className="text-gray-600 dark:text-[#A1A1AA]">
              Powered by advanced machine translation models like NLLB to ensure high-quality, context-aware results.
            </p>
          </div>

          {/* Access */}
          <div className="border border-gray-200 dark:border-[#27272A] p-6 rounded-lg hover:border-gray-300 dark:hover:border-[#3F3F46] transition-colors bg-white dark:bg-[#18181B]">
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#27272A] rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="text-gray-700 dark:text-[#E4E4E7]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Knowledge Access</h3>
            <p className="text-gray-600 dark:text-[#A1A1AA]">
              Democratizing access to information by making content understandable in anyone's native tongue.
            </p>
          </div>

          {/* Open Source */}
          <div className="border border-gray-200 dark:border-[#27272A] p-6 rounded-lg hover:border-gray-300 dark:hover:border-[#3F3F46] transition-colors bg-white dark:bg-[#18181B]">
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#27272A] rounded-lg flex items-center justify-center mb-4">
              <Languages className="text-gray-700 dark:text-[#E4E4E7]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Open Platform</h3>
            <p className="text-gray-600 dark:text-[#A1A1AA]">
              Built with open technologies and aimed at fostering a community of developers and linguists.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Ready to explore?</h2>
          <p className="text-gray-600 dark:text-[#A1A1AA] mb-6">Start breaking language barriers today.</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="bg-black dark:bg-white text-white dark:text-black font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Start Translating
            </Link>
            <Link
              to="/developer"
              className="bg-white dark:bg-[#27272A] border border-gray-300 dark:border-[#3F3F46] text-gray-700 dark:text-[#E4E4E7] font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3F3F46] transition-colors"
            >
              Developer API
            </Link>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-2 pb-6">
          <a
            href="https://www.linkedin.com/in/lewis-kimaru/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 dark:text-[#71717A] hover:text-gray-900 dark:hover:text-[#E4E4E7] transition-colors inline-flex items-center gap-1 group"
          >
            Built by <span className="font-medium text-gray-500 dark:text-[#A1A1AA] group-hover:text-black dark:group-hover:text-white border-b border-transparent group-hover:border-black dark:group-hover:border-white transition-all">Lewis Kimaru</span>
          </a>
        </div>
      </div>
    </div>
  );
}
