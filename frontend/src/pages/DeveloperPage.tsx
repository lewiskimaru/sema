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
    { id: 'javascript', label: 'JS', icon: <FileJson size={16} /> },
    { id: 'python', label: 'Python', icon: <FileCode size={16} /> },
    { id: 'nodejs', label: 'Node', icon: <Server size={16} /> },
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
    headers: { 'Content-Type': 'application/json' },
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
def translate_text(text, target_language):
    url = "https://sematech-sema-api.hf.space/api/v1/translate"
    payload = {
        "text": text,
        "target_language": target_language
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = translate_text("Habari ya asubuhi", "eng_Latn")
print(result["translated_text"])`,

    nodejs: `const axios = require('axios');

async function translate(text, targetLang) {
  const url = 'https://sematech-sema-api.hf.space/api/v1/translate';
  const response = await axios.post(url, {
    text: text,
    target_language: targetLang
  });
  return response.data;
}

// Usage
translate("Habari ya asubuhi", "eng_Latn")
  .then(res => console.log(res.translated_text));`
  };

  return (
    <div className="flex-1 w-full bg-white overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* Intro Section */}
        <div className="border-b border-gray-100 pb-6">
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
            Integrate powerful AI translation into your applications.
            <span className="block sm:inline mt-1 sm:mt-0 sm:ml-1">Free, fast, and easy to use.</span>
          </p>
        </div>

        {/* Stats Grid - Responsive: 2col mobile -> 2col tablet -> 4col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<Globe className="text-blue-600" size={20} />}
            value="200+"
            label="Languages Supported"
          />
          <StatCard
            icon={<Zap className="text-amber-500" size={20} />}
            value="Fast"
            label="Sub-second Latency"
          />
          <StatCard
            icon={<Code className="text-purple-600" size={20} />}
            value="REST"
            label="Simple Architecture"
          />
          <StatCard
            icon={<Shield className="text-green-600" size={20} />}
            value="Public"
            label="No Auth Required"
          />
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">

          {/* Section: Endpoints */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Server size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-800">Available Endpoints</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <EndpointRow
                method="POST"
                path="/translate"
                description="Translate text between supported languages."
                schema="{ text, target_language, source_language? }"
              />
              <EndpointRow
                method="POST"
                path="/detect-language"
                description="Identify the language of input text."
                schema="{ text }"
              />
              <EndpointRow
                method="GET"
                path="/languages"
                description="Retrieve a list of all 200+ supported languages."
              />
            </div>
          </div>

          {/* Section: Code Examples */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Tabs Scroll Container */}
            <div className="bg-gray-50 border-b border-gray-200 overflow-x-auto no-scrollbar">
              <div className="flex min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-r border-gray-200 last:border-r-0 focus:outline-none ${activeTab === tab.id
                      ? 'bg-white text-black text-shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block */}
            <div className="relative group">
              <div className="absolute right-2 top-2 z-10">
                <button
                  onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples], activeTab)}
                  className="p-2 bg-white/90 backdrop-blur border border-gray-200 rounded-md text-gray-500 hover:text-black hover:border-gray-300 transition-all shadow-sm"
                  aria-label="Copy to clipboard"
                >
                  {copiedCode === activeTab ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              {/* Note: max-w-[calc(100vw-2rem)] ensures it never overflows viewport on mobile */}
              <div className="overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
                <pre className="bg-gray-50 text-gray-800 p-4 pt-4 text-xs sm:text-sm font-mono leading-relaxed min-h-[300px]">
                  <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">

            {/* Base URL */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Base URL</h3>
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded border border-gray-200 w-full overflow-hidden h-[42px]">
                <code className="text-xs sm:text-sm font-mono text-green-700 truncate flex-1">
                  https://sematech-sema-api.hf.space/api/v1
                </code>
                <button
                  onClick={() => copyToClipboard("https://sematech-sema-api.hf.space/api/v1", "baseurl")}
                  className="p-1 text-gray-400 hover:text-black hover:bg-white rounded transition-colors flex-shrink-0"
                >
                  {copiedCode === "baseurl" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Resources Links */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider md:hidden">Resources</h3>
              <div className="grid grid-cols-2 gap-3 h-[42px]">
                <a
                  href="https://sematech-sema-api.hf.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 h-full bg-white border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium group"
                >
                  <span>Swagger UI</span>
                  <ExternalLink size={14} className="ml-2 text-gray-400 group-hover:text-black flex-shrink-0" />
                </a>
                <a
                  href="https://github.com/lewiskimaru/sema"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 h-full bg-white border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium group"
                >
                  <span>GitHub</span>
                  <ExternalLink size={14} className="ml-2 text-gray-400 group-hover:text-black flex-shrink-0" />
                </a>
              </div>
            </div>

          </div>

          {/* Usage Limits */}
          <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-blue-900">
              <div className="flex items-center gap-2 font-semibold">
                <Info size={16} className="text-blue-600" />
                Usage Rules:
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Unlimited requests</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>No API key</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>5k chars/request</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components to keep clean
function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/30 flex flex-col items-start gap-2 h-full">
      <div className="mb-0">{icon}</div>
      <div>
        <div className="font-bold text-gray-900 text-lg">{value}</div>
        <div className="text-xs sm:text-sm text-gray-600 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function EndpointRow({ method, path, description, schema }: { method: string, path: string, description: string, schema?: string }) {
  const isPost = method === 'POST';
  const colorClass = isPost ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${colorClass}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-gray-900">{path}</code>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {schema && (
        <div className="inline-block max-w-full">
          <div className="text-xs text-gray-500 font-mono bg-white border border-gray-200 p-1.5 rounded break-words">
            {schema}
          </div>
        </div>
      )}
    </div>
  );
}
