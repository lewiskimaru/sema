import { ArrowRight, BookOpen, Check, Globe, Languages, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">About Sema AI</h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            Breaking language barriers with state-of-the-art AI translation technology
          </p>
        </div>
        
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-[#555555] mb-6">
                Sema AI aims to create a world without language barriers, where everyone can communicate, learn, and share knowledge freely regardless of their native language.
              </p>
              <p className="text-lg text-[#555555]">
                Powered by Meta's No Language Left Behind (NLLB) technology, we offer high-quality translations across 200+ languages, including many that are often overlooked by traditional translation services.
              </p>
            </div>
            <div className="bg-[#F8F8F8] p-8 rounded-lg">
              <div className="flex gap-4 mb-6">
                <Globe size={32} className="text-[#555555]" />
                <div>
                  <h3 className="text-xl font-bold mb-1">Global Reach</h3>
                  <p className="text-[#555555]">Supporting 200+ languages from around the world</p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <Zap size={32} className="text-[#555555]" />
                <div>
                  <h3 className="text-xl font-bold mb-1">Instant Translation</h3>
                  <p className="text-[#555555]">Real-time translation for text, documents, and conversations</p>
                </div>
              </div>
              <div className="flex gap-4">
                <BookOpen size={32} className="text-[#555555]" />
                <div>
                  <h3 className="text-xl font-bold mb-1">Knowledge Access</h3>
                  <p className="text-[#555555]">Read articles and blogs in your native language</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#EFEFEF] p-6 rounded-lg">
              <Languages className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Accurate Translation</h3>
              <p className="text-[#555555]">
                State-of-the-art AI translation using Meta's NLLB technology for high-quality results
              </p>
            </div>
            <div className="border border-[#EFEFEF] p-6 rounded-lg">
              <Globe className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Global Content</h3>
              <p className="text-[#555555]">
                Discover and read web content in your preferred language, regardless of its original source
              </p>
            </div>
            <div className="border border-[#EFEFEF] p-6 rounded-lg">
              <BookOpen className="mb-4 text-black" size={32} />
              <h3 className="text-xl font-bold mb-2">Language Learning</h3>
              <p className="text-[#555555]">
                Improve your language skills through interactive translation and conversation
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-black text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-6">Create an account and start breaking language barriers today</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-[#EFEFEF] transition-colors">
            Sign up for free <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
