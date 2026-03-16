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
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
      setTimeout(() => setAnimate(true), 10);
      if (view !== 'signup') {
        const lastEmail = localStorage.getItem('rain_last_email');
        if (lastEmail) setEmail(lastEmail);
      }
    } else {
      // Restore background scrolling
      document.body.style.overflow = '';
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
    return () => {
      document.body.style.overflow = '';
    };
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
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-[400px] bg-white rounded-[32px] shadow-heavy p-6 md:p-8 border border-zinc-100 overflow-y-auto overflow-x-hidden max-h-[90vh] transition-all duration-500 ease-out transform ${animate ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'} custom-scrollbar`}>
        {/* Aesthetic Background Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-oroYellow/10 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          {/* Branded Icon Section */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-oroYellow rounded-[12px] flex items-center justify-center animate-bounce-slow">
              <svg className="w-6 h-6 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
                <path d="m13 11-4 6h6l-4 6" />
              </svg>
            </div>
          </div>

          <h2 className="text-lg font-black text-center text-zinc-900 tracking-tight mb-1 uppercase">
            {view === 'signup' ? 'Drop Idea' : view === 'login' ? 'Welcome Back' : 'Access Recovery'}
          </h2>
          <p className="text-center text-zinc-400 text-[10px] font-medium mb-4 px-4">
            {view === 'signup' 
              ? 'Create an account to access the OroDrop engine.' 
              : view === 'login' 
                ? 'Enter your credentials to re-ignite the synthesis.'
                : 'Enter your email to retrieve your neural credentials.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Feedback Messages */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest p-3 rounded-xl animate-shake">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest p-3 rounded-xl animate-fade-in">
                {successMsg}
              </div>
            )}
            
            {/* Dynamic Form Fields based on View */}
            {view === 'signup' && (
              <div className="space-y-1 animate-fade-in-up">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Viktoria Lane"
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 text-xs font-bold text-zinc-800 focus:bg-white focus:border-oroYellow focus:outline-none transition-all duration-300 shadow-inner"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="viktoria@agency.ai"
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold text-zinc-800 focus:bg-white focus:border-oroYellow focus:outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {view !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center pr-4">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-4">Password</label>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => handleViewChange('forgot')}
                      className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
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
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold text-zinc-800 focus:bg-white focus:border-oroYellow focus:outline-none transition-all duration-300 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 dark:text-zinc-500 hover:text-oroYellow transition-colors rounded-xl"
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
              className="w-full bg-zinc-900 text-oroYellow hover:bg-oroYellow hover:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-zinc-200 transition-all duration-300 active:scale-95 mt-2 group"
            >
              <span className="group-hover:tracking-[0.3em] transition-all duration-300">
                {view === 'signup' ? 'Create Account' : view === 'login' ? 'Log In' : 'Recover Protocol'}
              </span>
            </button>

            {/* Google Sign-in Section */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                <span className="bg-white px-4 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                console.log("Google Sign-in triggered. Implement your OAuth flow here.");
                alert("Google Sign-in is currently in placeholder mode. Please configure your OAuth credentials to enable this feature.");
              }}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-zinc-100 text-zinc-900 hover:border-zinc-900 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl transition-all duration-300 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Sub-navigation Links */}
          <div className="mt-4 text-center flex flex-col gap-2">
            <button 
              onClick={() => handleViewChange(view === 'signup' ? 'login' : 'signup')}
              className="text-[9px] font-black text-zinc-900 uppercase tracking-widest hover:underline transition-all"
            >
              {view === 'signup' ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
            </button>
            
            {view === 'forgot' && (
              <button 
                onClick={() => handleViewChange('login')}
                className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all"
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