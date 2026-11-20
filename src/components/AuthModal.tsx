import React, { useState } from 'react';
import type { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';
import { X, Lock, Mail, Phone, User as UserIcon, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState<string>('rahul.s@student.dgu.ac.in');
  const [loginPassword, setLoginPassword] = useState<string>('student123');

  // Register fields
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regCollege, setRegCollege] = useState<string>('');
  const [regDl, setRegDl] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login(loginEmailOrPhone);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        collegeOrHostel: regCollege,
        dlNumber: regDl
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (type: 'student' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (type === 'student') {
        const res = await api.login('rahul.s@student.dgu.ac.in');
        onLoginSuccess(res.user);
      } else {
        const res = await api.login('isha.0251mba104@dgu.ac.in', 'admin');
        onLoginSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0C10]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F5F6F8]">
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#0B0C10]">
              {mode === 'login' ? 'Sign In to Smooth Ride' : 'Create Student Account'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Access your scooter bookings and driver verification records
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-neutral-400 hover:text-[#0B0C10] hover:bg-neutral-200/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Quick Demo Logins for Fast Review */}
          <div className="p-3.5 bg-[#F5F6F8] rounded-2xl border border-neutral-200/80 space-y-2.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.12em] block">
              1-Click Instant Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                disabled={isLoading}
                className="py-2 px-2.5 text-xs font-bold bg-white hover:bg-neutral-100 text-[#0B0C10] border border-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-neutral-600" />
                <span>Student Renter</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                disabled={isLoading}
                className="py-2 px-2.5 text-xs font-bold bg-[#0B0C10] hover:bg-neutral-800 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#FFCA20]" />
                <span>Admin / Owner</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#F5F6F8] p-1 rounded-2xl border border-neutral-200/70">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-[#0B0C10] text-white shadow-xs' : 'text-neutral-600 hover:text-[#0B0C10]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' ? 'bg-[#0B0C10] text-white shadow-xs' : 'text-neutral-600 hover:text-[#0B0C10]'
              }`}
            >
              Register New Account
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul.s@student.dgu.ac.in"
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-xs font-extrabold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f4be10] disabled:bg-neutral-200 disabled:text-neutral-400 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Bisht"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">College or Hostel Name</label>
                <input
                  type="text"
                  placeholder="e.g. DBS Global University / Graphic Era / UPES"
                  value={regCollege}
                  onChange={(e) => setRegCollege(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Driving Licence (DL) Number</label>
                <input
                  type="text"
                  placeholder="e.g. UK07-20230045129"
                  value={regDl}
                  onChange={(e) => setRegDl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-xs font-extrabold text-[#0B0C10] bg-[#FFCA20] hover:bg-[#f4be10] disabled:bg-neutral-200 disabled:text-neutral-400 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Student Account</span>}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
