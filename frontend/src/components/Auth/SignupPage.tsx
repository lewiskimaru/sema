import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import TopBar from '../TopBar';

export default function SignupPage({ onSignup }: { onSignup: (user: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would send data to a server
    // For this demo, we'll just store in localStorage
    try {
      localStorage.setItem('semaUser', JSON.stringify({
        name,
        email,
        isLoggedIn: true
      }));

      if (onSignup) onSignup({ email, password, name });
      navigate('/');
    } catch (err) {
      setError('Error creating account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <TopBar
        onLogout={() => { }}
        isLoggedIn={false}
      />
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Join Sema AI</h1>
            <p className="text-[#555555] dark:text-[#A1A1AA]">Create an account to get started</p>
          </div>

          <div className="bg-white dark:bg-[#18181B] p-8 rounded-lg shadow-lg border border-[#EFEFEF] dark:border-[#27272A]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#333333] dark:text-[#E4E4E7] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-[#DCDCDC] dark:border-[#3F3F46] rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-[#27272A] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#333333] dark:text-[#E4E4E7] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-[#DCDCDC] dark:border-[#3F3F46] rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-[#27272A] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#333333] dark:text-[#E4E4E7] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-[#DCDCDC] dark:border-[#3F3F46] rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-[#27272A] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Create a password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#555555] dark:text-[#A1A1AA]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#555555] dark:text-[#A1A1AA]">Must be at least 8 characters</p>
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-[#333333] dark:bg-white dark:hover:bg-[#E4E4E7] text-white dark:text-black font-medium py-3 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                Create Account <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#555555] dark:text-[#A1A1AA]">Already have an account?</span>{' '}
              <Link to="/login" className="text-black dark:text-white font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
