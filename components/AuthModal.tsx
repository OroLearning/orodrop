/**
 * AUTH MODAL
 * Handles the entry gates of the application: Login, Signup, and Password Recovery.
 * Uses local storage for user profile simulation.
 */

import React, { useState, useEffect } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string }) => void;
}

type AuthView = 'signup' | 'login' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Modal Internal State
  const [view, setView] = useState<AuthView>('signup'); // Switch between sub-forms
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [animate, setAnimate] = useState(false); // Controls opening transitions

  // Transition Orchestration
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10);
      if (view !== 'signup') {
        const lastEmail = localStorage.getItem('rain_last_email');
        if (lastEmail) setEmail(lastEmail);
      }
    } else {
      setAnimate(false);
      setTimeout(() => {
        setView('signup');
        setEmail('');
        setName('');
        setPassword('');
        setShowPassword(false);
        setError('');
        setSuccessMsg('');
      }, 500);
    }
  }, [isOpen]);

  // View Switcher Handler
  const handleViewChange = (newView: AuthView) => {
    setView(newView);
    setError('');
    setSuccessMsg('');
    if (newView === 'signup') {
      setEmail('');
    } else {
      const lastEmail = localStorage.getItem('rain_last_email');
      if (lastEmail) setEmail(lastEmail);
    }
  };

  if (!isOpen) return null;

  /**
   * Main Form Submission Handler
   * Implements custom security validation and local profile persistence.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const users = JSON.parse(localStorage.getItem('rain_users') || '{}');
    const normalizedEmail = email.toLowerCase().trim();

    // Signup Logic with explicit security requirements
    if (view === 'signup') {
      if (users[normalizedEmail]) {
        setError('This email is already associated with an account.');
        return;
      }
      if (!name.trim()) {
        setError('Please enter your name to personalize your protocol.');
        return;
      }

      // Password Strength Validation Logic
      // Requirement: 6+ chars, 1 Capital, 1 Number, 1 Special Char
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 6 characters, including 1 uppercase letter, 1 number, and 1 special character.');
        return;
      }

      // Save user to simulated database
      users[normalizedEmail] = { password, name };
      localStorage.setItem('rain_users', JSON.stringify(users));
      localStorage.setItem('rain_last_email', normalizedEmail);
      onSuccess({ email: normalizedEmail, name });
    } 
    // Login Verification Logic
    else if (view === 'login') {
      const user = users[normalizedEmail];
      if (user && user.password === password) {
        localStorage.setItem('rain_last_email', normalizedEmail);
        onSuccess({ email: normalizedEmail, name: user.name });
      } else {
        setError('Invalid credentials. Please verify your email and password.');
      }
    } 
    // Recovery Logic simulation
    else if (view === 'forgot') {
      if (users[normalizedEmail]) {
        console.log(`[RAIN Vault Recovery] Sending password "${users[normalizedEmail].password}" to ${normalizedEmail}`);
        setSuccessMsg(`Protocol recovery active. Your access key has been dispatched to ${normalizedEmail}.`);
      } else {
        setError('No neural profile found for this email address.');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop Trigger */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-md bg-white rounded-[44px] shadow-heavy p-10 border border-slate-100 overflow-hidden transition-all duration-500 ease-out transform ${animate ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>
        {/* Aesthetic Background Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-oroYellow/10 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          {/* Branded Icon Section */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-oroYellow rounded-[20px] flex items-center justify-center animate-bounce-slow">
              <svg className="w-10 h-10 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
                <path d="m13 11-4 6h6l-4 6" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-black text-center text-slate-900 tracking-tight mb-2 uppercase">
            {view === 'signup' ? 'Begin Protocol' : view === 'login' ? 'Welcome Back' : 'Access Recovery'}
          </h2>
          <p className="text-center text-slate-400 text-sm font-medium mb-8 px-4">
            {view === 'signup' 
              ? 'Create an account to access the OroDrop engine.' 
              : view === 'login' 
                ? 'Enter your credentials to re-ignite the synthesis.'
                : 'Enter your email to retrieve your neural credentials.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Messages */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl animate-shake">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl animate-fade-in">
                {successMsg}
              </div>
            )}
            
            {/* Dynamic Form Fields based on View */}
            {view === 'signup' && (
              <div className="space-y-1 animate-fade-in-up">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Viktoria Lane"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-oroYellow focus:outline-none transition-all duration-300 shadow-inner"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="viktoria@agency.ai"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-oroYellow focus:outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {view !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center pr-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => handleViewChange('forgot')}
                      className="text-[10px] font-black text-oroYellow uppercase tracking-widest hover:text-oroYellow/80 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative group/input">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-14 text-sm font-bold text-slate-800 focus:bg-white focus:border-oroYellow focus:outline-none transition-all duration-300 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-oroYellow transition-colors rounded-xl"
                  >
                    {/* Toggle SVG logic for visibility */}
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-oroYellow hover:text-slate-900 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 active:scale-95 mt-4 group"
            >
              <span className="group-hover:tracking-[0.3em] transition-all duration-300">
                {view === 'signup' ? 'Create Account' : view === 'login' ? 'Log In' : 'Recover Protocol'}
              </span>
            </button>
          </form>

          {/* Sub-navigation Links */}
          <div className="mt-8 text-center flex flex-col gap-3">
            <button 
              onClick={() => handleViewChange(view === 'signup' ? 'login' : 'signup')}
              className="text-[10px] font-black text-oroYellow uppercase tracking-widest hover:underline transition-all"
            >
              {view === 'signup' ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
            </button>
            
            {view === 'forgot' && (
              <button 
                onClick={() => handleViewChange('login')}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
              >
                Return to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;