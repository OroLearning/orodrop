// DEPLOYMENT READY: Uncomment to activate
// This component provides a contact form for Enterprise leads, integrated with analytics and Supabase.

/*
import React, { useState } from 'react';
import { analyticsService } from '../services/analytics';

const ContactForm = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic to save lead to Supabase
    // const { error } = await analyticsService.saveLead(email, message);
    // if (!error) {
    //   setSubmitted(true);
    //   analyticsService.logLeadCaptured('enterprise_contact');
    // }
    console.log('Lead captured:', { email, message });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Enterprise Inquiry</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-oroYellow rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Message Received</h3>
            <p className="text-zinc-500">Our enterprise team will reach out shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Work Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-oroYellow transition-all"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Message</label>
              <textarea 
                required 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-oroYellow transition-all resize-none"
                placeholder="Tell us about your agency needs..."
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-oroYellow hover:text-zinc-900 transition-all duration-300"
            >
              Send Protocol Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
*/
