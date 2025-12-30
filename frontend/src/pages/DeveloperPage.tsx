import { useState } from 'react';
import { Code, Globe, Zap, Shield, Copy, Check, ExternalLink, Terminal, FileJson, FileCode, Server, Info } from 'lucide-react';

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
    { id: 'curl', label: 'cURL', icon: <Terminal size={16} /> },
    { id: 'javascript', label: 'JavaScript', icon: <FileJson size={16} /> },
    { id: 'python', label: 'Python', icon: <FileCode size={16} /> },
    { id: 'nodejs', label: 'Node.js', icon: <Server size={16} /> },
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
      <div className="max-w-[1000px] mx-auto p-6 space-y-8">
        {/* Intro */}
        <div className="border-b border-gray-100 pb-8">
          <p className="text-lg text-gray-600 max-w-2xl">
            Integrate powerful AI translation into your applications. Free, fast, and easy to use.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="text-gray-500" size={20} />
              <span className="font-semibold">200+</span>
            </div>
            <p className="text-sm text-gray-600">Languages Supported</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="text-gray-500" size={20} />
              <span className="font-semibold">Fast</span>
            </div>
            <p className="text-sm text-gray-600">Sub-second Latency</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Code className="text-gray-500" size={20} />
              <span className="font-semibold">REST</span>
            </div>
            <p className="text-sm text-gray-600">Simple Architecture</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-gray-500" size={20} />
              <span className="font-semibold">Public</span>
            </div>
            <p className="text-sm text-gray-600">No Auth Required</p>
          </div>
        </div>

        {/* Integration Section */}
        <div className="flex flex-col gap-8">
          {/* API Details */}
          <div className="space-y-8">
            {/* Endpoints Card */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold flex items-center gap-2">
                  <Server size={18} /> Available Endpoints
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono font-medium">POST</span>
                    <code className="text-sm font-mono text-gray-800">/translate</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Translate text between supported languages.</p>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    {"{ text, target_language, source_language? }"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono font-medium">POST</span>
                    <code className="text-sm font-mono text-gray-800">/detect-language</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Identify the language of input text.</p>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    {"{ text }"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono font-medium">GET</span>
                    <code className="text-sm font-mono text-gray-800">/languages</code>
                  </div>
                  <p className="text-sm text-gray-600">Retrieve a list of all 200+ supported languages and codes.</p>
                </div>
              </div>
            </div>

            {/* Code Examples Card */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-r border-gray-200 ${activeTab === tab.id
                      ? 'bg-white text-black border-b-white -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <pre className="bg-gray-50 text-gray-800 p-4 text-sm font-mono overflow-x-auto min-h-[300px] border-t border-gray-100">
                  <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples], activeTab)}
                  className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-50 rounded-md text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all border border-gray-200 shadow-sm"
                  title="Copy to clipboard"
                >
                  {copiedCode === activeTab ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Info & Links - Now stacked below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base URL Card */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg text-gray-900">
              <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Base URL</h3>
              <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                <code className="text-xs font-mono text-green-700 truncate">
                  https://sematech-sema-api.hf.space/api/v1
                </code>
                <button
                  onClick={() => copyToClipboard("https://sematech-sema-api.hf.space/api/v1", "baseurl")}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  {copiedCode === "baseurl" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Resources Card */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-3">
                <a
                  href="https://sematech-sema-api.hf.space/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black">Swagger UI</span>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-black" />
                </a>
                <a
                  href="https://github.com/lewiskimaru/sema"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black">GitHub Repo</span>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-black" />
                </a>
              </div>
            </div>

            {/* Limits Card */}
            <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-5">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info size={18} className="text-blue-600" /> Usage Limits
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Unlimited requests
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  No API key needed
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  5,000 chars / request
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
