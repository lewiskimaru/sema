import { useState } from 'react';
import { ClipboardCopy, Code, Copy, Download, Key, RefreshCw, Settings, ShieldCheck } from 'lucide-react';

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('keys');
  const [apiKeys] = useState([
    { id: 'key_1', name: 'Production Key', key: 'sema_prod_3x7a91b2c8d', created: 'May 15, 2025', lastUsed: 'Today, 2:45 PM', status: 'active' },
    { id: 'key_2', name: 'Testing Key', key: 'sema_test_9f2e5c1d8b3a', created: 'May 10, 2025', lastUsed: 'Yesterday', status: 'active' },
    { id: 'key_3', name: 'Development Key', key: 'sema_dev_4e5f6a7b8c9d', created: 'Apr 28, 2025', lastUsed: '3 days ago', status: 'inactive' }
  ]);
  
  const [showCopied, setShowCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(keyId);
    setTimeout(() => setShowCopied(null), 2000);
  };

  // Mock usage data
  const usageData = {
    total: 5840,
    used: 3210,
    remaining: 2630,
    plan: 'Developer Pro',
    nextReset: 'Jun 28, 2025'
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Developer Dashboard</h1>
          <p className="text-[#555555]">
            Manage your API keys and track usage for Sema AI integrations
          </p>
        </div>
        
        <div className="flex border-b border-[#EFEFEF] mb-6">
          <button
            onClick={() => setActiveTab('keys')}
            className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'keys' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
          >
            <Key size={16} />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'usage' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
          >
            <RefreshCw size={16} />
            Usage
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'docs' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
          >
            <Code size={16} />
            Documentation
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'settings' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
        
        {activeTab === 'keys' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Your API Keys</h2>
              <button className="px-4 py-2 bg-black text-white rounded hover:bg-[#333333]">
                Create New Key
              </button>
            </div>
            
            <div className="border border-[#EFEFEF] rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-[#F8F8F8] p-3 text-sm font-medium">
                <div className="col-span-3">Name</div>
                <div className="col-span-5">API Key</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {apiKeys.map(key => (
                <div key={key.id} className="grid grid-cols-12 p-3 border-t border-[#EFEFEF] text-sm items-center">
                  <div className="col-span-3">
                    <div className="font-medium">{key.name}</div>
                    <div className="text-xs text-[#555555]">Last used: {key.lastUsed}</div>
                  </div>
                  <div className="col-span-5 flex items-center gap-2">
                    <div className="bg-[#F0F0F0] px-3 py-1 rounded font-mono text-xs truncate">
                      {key.key}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="p-1 hover:bg-[#F0F0F0] rounded"
                      title="Copy to clipboard"
                    >
                      {showCopied === key.id ? <ClipboardCopy size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="col-span-2 text-[#555555]">{key.created}</div>
                  <div className="col-span-2 flex gap-2">
                    <button className="p-1 hover:bg-[#F0F0F0] rounded" title="Regenerate key">
                      <RefreshCw size={16} />
                    </button>
                    <button className="p-1 hover:bg-[#F0F0F0] rounded text-red-600" title="Delete key">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-[#F8F8F8] rounded-lg border border-[#EFEFEF]">
              <div className="flex gap-2 items-center mb-2">
                <ShieldCheck size={18} className="text-[#555555]" />
                <h3 className="font-medium">Security Recommendations</h3>
              </div>
              <ul className="text-sm text-[#555555] list-disc pl-6 space-y-2">
                <li>Store API keys securely and never expose them in client-side code</li>
                <li>Regenerate keys regularly for optimal security</li>
                <li>Use environment variables to store keys in your applications</li>
                <li>Create separate keys for development, testing, and production environments</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'usage' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-[#EFEFEF] rounded-lg p-4">
                <div className="text-sm text-[#555555] mb-1">API Calls This Month</div>
                <div className="text-2xl font-bold">{usageData.used.toLocaleString()}</div>
                <div className="mt-2 bg-[#EFEFEF] h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full" style={{ width: `${(usageData.used / usageData.total) * 100}%` }}></div>
                </div>
                <div className="mt-1 text-xs text-[#555555] flex justify-between">
                  <span>0</span>
                  <span>{usageData.total.toLocaleString()} (limit)</span>
                </div>
              </div>
              
              <div className="border border-[#EFEFEF] rounded-lg p-4">
                <div className="text-sm text-[#555555] mb-1">Current Plan</div>
                <div className="text-xl font-bold">{usageData.plan}</div>
                <div className="mt-2 text-sm">
                  <span className="text-[#555555]">Resets on: </span>
                  <span>{usageData.nextReset}</span>
                </div>
              </div>
              
              <div className="border border-[#EFEFEF] rounded-lg p-4">
                <div className="text-sm text-[#555555] mb-1">Remaining Calls</div>
                <div className="text-2xl font-bold">{usageData.remaining.toLocaleString()}</div>
                <button className="mt-2 text-sm text-black hover:underline flex items-center gap-1">
                  <Download size={14} />
                  Download usage report
                </button>
              </div>
            </div>
            
            <div className="border border-[#EFEFEF] rounded-lg p-4">
              <h3 className="font-medium mb-4">Usage by Endpoint</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Translation API</span>
                    <span className="text-sm">2,145 calls (67%)</span>
                  </div>
                  <div className="bg-[#EFEFEF] h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Chat API</span>
                    <span className="text-sm">865 calls (27%)</span>
                  </div>
                  <div className="bg-[#EFEFEF] h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full" style={{ width: '27%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Document Analysis</span>
                    <span className="text-sm">200 calls (6%)</span>
                  </div>
                  <div className="bg-[#EFEFEF] h-2 rounded-full overflow-hidden">
                    <div className="bg-black h-full" style={{ width: '6%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'docs' && (
          <div className="border border-[#EFEFEF] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">API Documentation</h2>
            <p className="mb-4">
              Integrate Sema AI's powerful translation and language processing capabilities into your applications.
            </p>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Quick Start Guide</h3>
              <div className="bg-[#F8F8F8] p-4 rounded font-mono text-sm mb-2">
                <pre>{`curl -X POST https://api.sema.ai/v1/translate \
                -H "Authorization: Bearer YOUR_API_KEY" \
                -H "Content-Type: application/json" \
                -d '{"text": "Hello world", "source": "en", "target": "es"}'`}</pre>
              </div>
              <button className="text-sm flex items-center gap-1 hover:underline">
                <Copy size={14} />
                Copy code
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#" className="border border-[#EFEFEF] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors">
                <h3 className="font-medium mb-1">REST API Reference</h3>
                <p className="text-sm text-[#555555]">
                  Complete documentation for all API endpoints
                </p>
              </a>
              
              <a href="#" className="border border-[#EFEFEF] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors">
                <h3 className="font-medium mb-1">SDK Documentation</h3>
                <p className="text-sm text-[#555555]">
                  Client libraries for JavaScript, Python, and more
                </p>
              </a>
              
              <a href="#" className="border border-[#EFEFEF] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors">
                <h3 className="font-medium mb-1">Code Examples</h3>
                <p className="text-sm text-[#555555]">
                  Sample integrations and use cases
                </p>
              </a>
              
              <a href="#" className="border border-[#EFEFEF] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors">
                <h3 className="font-medium mb-1">Webhooks</h3>
                <p className="text-sm text-[#555555]">
                  Setting up and managing webhook integrations
                </p>
              </a>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="border border-[#EFEFEF] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">API Settings</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Default Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Source Language</label>
                  <select className="w-full p-2 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Default Target Language</label>
                  <select className="w-full p-2 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Translation Quality</label>
                  <select className="w-full p-2 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Rate Limiting</h3>
              <div className="flex items-center mb-2">
                <input type="checkbox" id="rate-limiting" className="mr-2" checked />
                <label htmlFor="rate-limiting" className="text-sm">Enable rate limiting</label>
              </div>
              <p className="text-xs text-[#555555] mb-2">
                Rate limiting helps prevent accidental abuse of your API keys. 
                When enabled, we'll restrict the number of requests per minute from a single source.
              </p>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  className="w-20 p-2 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black" 
                  value="100"
                />
                <span className="text-sm">requests per minute</span>
              </div>
            </div>
            
            <button className="px-4 py-2 bg-black text-white rounded hover:bg-[#333333]">
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}