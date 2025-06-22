import { BookOpen, Globe, Languages, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[800px] mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">About Sema AI</h1>
          <p className="text-xl text-[#555555]">
            Breaking language barriers with state-of-the-art AI translation technology
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-[#555555] mb-6 leading-relaxed">
            Sema AI aims to create a world without language barriers, where everyone can communicate, learn, and share knowledge freely regardless of their native language.
          </p>
          <p className="text-lg text-[#555555] mb-8 leading-relaxed">
            Powered by Meta's No Language Left Behind (NLLB) technology, we offer high-quality translations across 200+ languages, including many that are often overlooked by traditional translation services.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Global Reach</h2>
          <div className="flex items-start gap-4 mb-6">
            <Globe size={32} className="text-[#555555] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Supporting 200+ Languages</h3>
              <p className="text-[#555555] leading-relaxed">
                We support languages from around the world, including many indigenous and underrepresented languages that are often overlooked by traditional translation services.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Instant Translation</h2>
          <div className="flex items-start gap-4 mb-6">
            <Zap size={32} className="text-[#555555] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Real-time Processing</h3>
              <p className="text-[#555555] leading-relaxed">
                Experience lightning-fast translation for text, documents, and conversations. Our advanced AI processes your content in real-time, delivering accurate results instantly.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Knowledge Access</h2>
          <div className="flex items-start gap-4 mb-8">
            <BookOpen size={32} className="text-[#555555] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Learn and Discover</h3>
              <p className="text-[#555555] leading-relaxed">
                Read articles, blogs, and educational content in your native language. Break down language barriers to access knowledge from around the world and improve your language skills through interactive translation.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Key Features</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Languages className="text-black mt-1 flex-shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-bold mb-2">Accurate Translation</h3>
                <p className="text-[#555555] leading-relaxed">
                  State-of-the-art AI translation using Meta's NLLB technology for high-quality results. Our advanced algorithms ensure contextual accuracy and natural-sounding translations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Globe className="text-black mt-1 flex-shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-bold mb-2">Global Content Access</h3>
                <p className="text-[#555555] leading-relaxed">
                  Discover and read web content in your preferred language, regardless of its original source. Break down language barriers to access information from around the world.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <BookOpen className="text-black mt-1 flex-shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-bold mb-2">Language Learning</h3>
                <p className="text-[#555555] leading-relaxed">
                  Improve your language skills through interactive translation and conversation. Learn new languages naturally through real-world content and practice.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Technology</h2>
          <p className="text-lg text-[#555555] mb-6 leading-relaxed">
            Sema AI is built on Meta's No Language Left Behind (NLLB) technology, a breakthrough in machine translation that focuses on low-resource languages. This ensures that even the most underrepresented languages receive high-quality translation support.
          </p>
          <p className="text-lg text-[#555555] mb-8 leading-relaxed">
            Our platform combines cutting-edge AI with an intuitive user interface, making professional-grade translation accessible to everyone, regardless of technical expertise.
          </p>
        </div>

        <div className="bg-black text-white p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-6">Start breaking language barriers today</p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              className="bg-white text-black font-medium px-6 py-3 rounded-full hover:bg-[#EFEFEF] transition-colors"
            >
              Try Sema Now
            </Link>
            <Link
              to="/developer"
              className="border border-white text-white font-medium px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors"
            >
              Try API
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
