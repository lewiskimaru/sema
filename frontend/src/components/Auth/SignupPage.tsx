import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    
    // In a real app, this would send data to a server
    // For this demo, we'll just store in localStorage
    try {
      localStorage.setItem('semaUser', JSON.stringify({
        name,
        email,
        isLoggedIn: true
      }));
      
      navigate('/');
    } catch (err) {
      setError('Error creating account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f8f8] to-[#ffffff] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Sema AI</h1>
          <p className="text-[#555555]">Create an account to get started</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#EFEFEF]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#333333] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your full name"
                required
              />
            </div>
            
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
              <label className="block text-sm font-medium text-[#333333] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-[#DCDCDC] rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Create a password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#555555]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-[#555555]">Must be at least 8 characters</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-black hover:bg-[#333333] text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight size={16} />
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-[#555555]">Already have an account?</span>{' '}
            <Link to="/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
