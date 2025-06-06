import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

const mockUsers = [
  { email: 'demo@sema.ai', password: 'password123' },
  { email: 'test@sema.ai', password: 'test123' }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Check if user exists in mock data
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Store user info in localStorage
      localStorage.setItem('semaUser', JSON.stringify({ email: user.email, isLoggedIn: true }));
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#ffffff] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Sema AI</h1>
          <p className="text-[#555555]">Sign in to continue to your account</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#EFEFEF]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#333333] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-[#333333]">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#555555] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#555555]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-black hover:bg-[#333333] text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-[#555555]">Don't have an account?</span>{' '}
            <Link to="/signup" className="text-black font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
