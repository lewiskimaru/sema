import { useState } from 'react';
import { Code, Globe, Zap, Shield, Copy, Check, ExternalLink } from 'lucide-react';

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const tabs = [
    { id: 'curl', label: 'cURL', icon: '🌐' },
    { id: 'javascript', label: 'JavaScript', icon: '🟨' },
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'nodejs', label: 'Node.js', icon: '🟢' },
  ];

  const codeExamples = {
    curl: `# Basic Translation
curl -X POST "https://sematech-sema-api.hf.space/api/v1/translate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Habari ya asubuhi",
    "target_language": "eng_Latn"
  }'

# Language Detection
curl -X POST "https://sematech-sema-api.hf.space/api/v1/detect-language" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Habari ya asubuhi"
  }'

# Get Supported Languages
curl -X GET "https://sematech-sema-api.hf.space/api/v1/languages"`,

    javascript: `// Basic Translation
const translateText = async (text, targetLanguage) => {
  const response = await fetch('https://sematech-sema-api.hf.space/api/v1/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      target_language: targetLanguage
    })
  });

  const result = await response.json();
  return result.translated_text;
};

// Usage
translateText("Habari ya asubuhi", "eng_Latn")
  .then(translation => console.log(translation));`,

    python: `import requests

# Basic Translation
def translate_text(text, target_language, source_language=None):
    url = "https://sematech-sema-api.hf.space/api/v1/translate"

    payload = {
        "text": text,
        "target_language": target_language
    }

    if source_language:
        payload["source_language"] = source_language

    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = translate_text("Habari ya asubuhi", "eng_Latn")
print(result["translated_text"])`,

    nodejs: `const axios = require('axios');

class SemaAPI {
  constructor() {
    this.baseURL = 'https://sematech-sema-api.hf.space/api/v1';
  }

  async translate(text, targetLanguage, sourceLanguage = null) {
    const payload = {
      text: text,
      target_language: targetLanguage
    };

    if (sourceLanguage) {
      payload.source_language = sourceLanguage;
    }

    const response = await axios.post(\`\${this.baseURL}/translate\`, payload);
    return response.data;
  }

  async detectLanguage(text) {
    const response = await axios.post(\`\${this.baseURL}/detect-language\`, {
      text: text
    });
    return response.data;
  }
}

// Usage
const sema = new SemaAPI();
sema.translate("Habari ya asubuhi", "eng_Latn")
  .then(result => console.log(result.translated_text));`
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[800px] mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-4">Sema API Documentation</h1>
          <p className="text-xl text-[#555555]">
            Integrate powerful AI translation into your applications
          </p>
        </div>

        {/* Free API Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Zap size={24} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Free API Access</h3>
              <p className="text-green-700">
                Our translation API is currently <strong>completely free</strong> to use!
                No API keys required, no rate limits, no hidden costs.
                Perfect for developers, researchers, and anyone building multilingual applications.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div>
          <h2 className="text-3xl font-bold mb-6">API Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <Globe className="text-[#555555] mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold mb-2">200+ Languages</h3>
                <p className="text-[#555555]">
                  Support for major world languages and many underrepresented languages
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Zap className="text-[#555555] mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold mb-2">Fast & Reliable</h3>
                <p className="text-[#555555]">
                  High-performance translation with sub-second response times
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Code className="text-[#555555] mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold mb-2">RESTful API</h3>
                <p className="text-[#555555]">
                  Simple HTTP endpoints that work with any programming language
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="text-[#555555] mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold mb-2">No Authentication</h3>
                <p className="text-[#555555]">
                  Get started immediately without API keys or registration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Base URL</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <code className="text-sm font-mono">
              https://sematech-sema-api.hf.space/api/v1
            </code>
          </div>
        </div>

        {/* Code Examples */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Code Examples</h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white border-b-2 border-black'
                    : 'text-[#666] hover:text-black hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Block */}
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples], activeTab)}
              className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              title="Copy code"
            >
              {copiedCode === activeTab ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* API Endpoints */}
        <div>
          <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                <code className="font-mono text-sm">/translate</code>
              </div>
              <p className="text-[#555555] mb-2">Translate text between languages</p>
              <p className="text-sm text-[#666]">
                <strong>Parameters:</strong> text (required), target_language (required), source_language (optional)
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                <code className="font-mono text-sm">/detect-language</code>
              </div>
              <p className="text-[#555555] mb-2">Detect the language of input text</p>
              <p className="text-sm text-[#666]">
                <strong>Parameters:</strong> text (required)
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="font-mono text-sm">/languages</code>
              </div>
              <p className="text-[#555555] mb-2">Get list of all supported languages</p>
              <p className="text-sm text-[#666]">
                <strong>Returns:</strong> Array of language objects with codes and names
              </p>
            </div>
          </div>
        </div>

        {/* Interactive API Explorer */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Try the API</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-[#555555] mb-4">
              Explore our API interactively with the Swagger UI documentation:
            </p>
            <a
              href="https://sematech-sema-api.hf.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ExternalLink size={16} />
              Open API Explorer
            </a>
          </div>
        </div>

        {/* Response Examples */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Response Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Translation Response</h3>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`{
  "translated_text": "Good morning",
  "source_language": "swh_Latn",
  "target_language": "eng_Latn",
  "confidence": 0.95,
  "processing_time": 0.234
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Language Detection Response</h3>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{`{
  "detected_language": "swh_Latn",
  "confidence": 0.98,
  "alternatives": [
    {"language": "swh_Latn", "confidence": 0.98},
    {"language": "eng_Latn", "confidence": 0.02}
  ]
}`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Rate Limits & Usage */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Usage & Limits</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Current Limits (Free Tier)</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• <strong>Rate Limit:</strong> No limits currently enforced</li>
              <li>• <strong>Text Length:</strong> Up to 5,000 characters per request</li>
              <li>• <strong>Concurrent Requests:</strong> No restrictions</li>
              <li>• <strong>Daily Usage:</strong> Unlimited during free tier</li>
            </ul>
            <p className="text-blue-600 mt-4 text-sm">
              <strong>Note:</strong> These generous limits may change as we scale. We'll provide advance notice of any changes.
            </p>
          </div>
        </div>

        {/* Support */}
        <div className="bg-black text-white p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-xl mb-6">
            Get support and join our developer community
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://sematech-sema-api.hf.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              API Documentation
            </a>
            <a
              href="https://github.com/lewiskimaru/sema"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white text-white font-medium px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
