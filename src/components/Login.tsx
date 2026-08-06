import React, { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { navigateTo } from '../lib/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('pickupr_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') navigateTo('/admin');
        else if (user.role === 'customer') navigateTo('/customer');
      } catch (e) {}
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const cleanEmail = email.trim();
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail);

      if (dbError) throw dbError;

      let user = data?.[0];
      
      if (!user) {
        setError('User not found. If the user exists in the database, this is likely caused by Row Level Security (RLS). Go to Supabase -> Table Editor -> users, and click "RLS enabled" in the top-right corner to disable it (or add a SELECT policy).');
         return;
      }
      
      if (user.password !== password) {
        setError('Invalid password. Please check capitalization and spaces.');
         return;
      }

      // Store basic user info if needed
      localStorage.setItem('pickupr_user', JSON.stringify(user));
      
      switch (user.role) {
        case 'admin':
          navigateTo('/admin');
          break;
        case 'customer':
          navigateTo('/customer');
          break;
        default:
          navigateTo('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(`Network or server error: ${err.message}. Please check whether Supabase is configured.`);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const knownEmails = ['admin@taxioranje.nl', 'driver@taxioranje.nl', 'customer@taxioranje.nl'];
    
    if (email) {
      if (knownEmails.includes(email) || email.includes('admin') || email.includes('taxi')) {
        setResetSuccess(true);
        setError('');
      } else {
        setResetSuccess(false);
        setError('Email address not found in our system.');
      }
    } else {
      setError('Please enter your email address.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        {isResetMode ? (
          <div>
            <h1 className="text-3xl font-bold mb-4 text-center text-white">Reset Password</h1>
            <p className="text-zinc-400 text-center mb-8">Enter your email address and we'll send you a link to reset your password.</p>
            
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm text-center">{error}</div>}
            {resetSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500 text-green-500 rounded-lg text-sm text-center">Password reset link sent to your email.</div>}

            <form className="space-y-6" onSubmit={handleReset}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                     placeholder="your@email.com"
                   />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-lg transition-colors">
                Send Reset Link
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setIsResetMode(false); setResetSuccess(false); setError(''); }} className="text-zinc-400 hover:text-white transition-colors text-sm">
                &larr; Back to Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-center text-white">Login</h1>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm text-center">{error}</div>}

            <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                 placeholder="your@email.com"
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
               <input 
                 type="password" 
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                 placeholder="••••••••"
               />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-zinc-900" />
              <span className="text-zinc-400">Remember me</span>
            </label>
            <button type="button" onClick={() => { setIsResetMode(true); setError(''); }} className="text-yellow-500 hover:text-yellow-400">Forgot password?</button>
          </div>

          <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-lg transition-colors">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-zinc-400 text-sm">Don't have an account?</p>
          <div className="flex gap-4 justify-center mt-4">
            <button onClick={() => navigateTo('/register')} className="flex items-center gap-2 text-sm text-white hover:text-yellow-500 transition-colors">
              <User className="w-4 h-4" /> Register as customer
            </button>
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  );
}
