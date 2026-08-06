import React, { useState } from 'react';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { navigateTo } from '../lib/navigation';

export default function CustomerRegistration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const { data, error: dbError } = await supabase
        .from('users')
        .insert([{
          email: formData.email,
          password: formData.password,
          role: 'customer',
          name,
          phone: formData.phone
        }])
        .select();

      if (dbError) {
        if (dbError.code === '23505') {
           setError('Email already exists');
           return;
        }
        throw dbError;
      }
      
      // Simulate successful registration and redirect logic
      navigateTo('/login');
    } catch (err: any) {
      setError(`Server error during registration. ${err.message || 'Check DB connection.'}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-50 text-zinc-900 flex items-center justify-center font-sans">
      <div className="w-full max-w-xl p-8 sm:p-10 bg-white border border-zinc-200/80 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Create an Account</h1>
          <p className="text-zinc-500">Sign up to easily book rides and manage your transfers.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center justify-center">{error}</div>}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="+31 6 1234 5678"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-medium focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-lg shadow-zinc-900/10 hover:shadow-xl hover:shadow-zinc-900/20 transition-all active:scale-[0.98]">
              Create Account
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <button onClick={() => navigateTo('/login')} className="text-zinc-900 font-bold hover:text-yellow-600 transition-colors">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
