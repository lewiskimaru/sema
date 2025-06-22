import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import TopBar from '../TopBar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a password reset email
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <TopBar
        onLogout={() => {}}
        isLoggedIn={false}
      />
      <div className="flex-1 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-[#555555]">
            {!submitted
              ? "Enter your email to receive a password reset link"
              : "Check your email for reset instructions"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#EFEFEF]">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
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

              <button
                type="submit"
                className="w-full bg-black hover:bg-[#333333] text-white font-medium py-3 rounded-full transition-colors"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <p className="mb-6">
                If an account exists with {email}, we've sent instructions to reset your password.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#555555] hover:text-black flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
