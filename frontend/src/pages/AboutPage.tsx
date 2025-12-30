import { BookOpen, Globe, Languages, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[1000px] mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="border-b border-gray-100 pb-8">
          <p className="text-lg text-gray-600 max-w-2xl">
            Breaking language barriers with state-of-the-art AI technology.
            Open, accessible, and inclusive.
          </p>
        </div>

        {/* Mission Statement in a prominent feature card */}
        <div className="bg-black text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed text-gray-200 max-w-3xl">
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
          <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <Globe className="text-gray-700" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Reach</h3>
            <p className="text-gray-600">
              Supporting 200+ languages, including many underrepresented ones often overlooked by major providers.
            </p>
          </div>

          {/* Technology */}
          <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-gray-700" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Advanced AI</h3>
            <p className="text-gray-600">
              Powered by advanced machine translation models like NLLB to ensure high-quality, context-aware results.
            </p>
          </div>

          {/* Access */}
          <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="text-gray-700" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Knowledge Access</h3>
            <p className="text-gray-600">
              Democratizing access to information by making content understandable in anyone's native tongue.
            </p>
          </div>

          {/* Open Source */}
          <div className="border border-gray-200 p-6 rounded-lg hover:border-gray-300 transition-colors">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <Languages className="text-gray-700" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Open Platform</h3>
            <p className="text-gray-600">
              Built with open technologies and aimed at fostering a community of developers and linguists.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to explore?</h2>
          <p className="text-gray-600 mb-6">Start breaking language barriers today.</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="bg-black text-white font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Translating
            </Link>
            <Link
              to="/developer"
              className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
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
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
          >
            Built by <span className="font-medium text-gray-500 group-hover:text-black border-b border-transparent group-hover:border-black transition-all">Lewis Kimaru</span>
          </a>
        </div>
      </div>
    </div>
  );
}
