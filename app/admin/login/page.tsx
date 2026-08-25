'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your login details.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user?.name || 'Executive Officer'}. Redirecting to portal...`);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMessage('Network connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-['Montserrat',sans-serif] relative overflow-hidden">
      {/* Background Architectural Accent Shapes */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#014900] to-[#013300] -skew-y-3 origin-top-left scale-110 pointer-events-none" />
      <div className="absolute top-12 right-12 w-96 h-96 bg-[#D9A000]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Portal Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border-2 border-[#D9A000] flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                alt="GNUTS Emblem"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              GNUTS <span className="text-[#D9A000]">Executive</span> Portal
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm font-medium mt-1">
              Sign in with your administrative credentials
            </p>
          </div>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-200/90 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#014900]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                Official Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin@gnuts.org.gh"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/80 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-[#014900] focus:bg-white focus:ring-2 focus:ring-[#014900]/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-gray-50/80 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-[#014900] focus:bg-white focus:ring-2 focus:ring-[#014900]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#014900] hover:bg-[#003300] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Details...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 text-[#D9A000]" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Back to Public Site Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-bold text-gray-500 hover:text-[#014900] transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Return to GNUTS Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
