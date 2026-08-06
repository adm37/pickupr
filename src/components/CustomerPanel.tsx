import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, FileText, Settings, User, MapPin, CheckCircle, Star, LogOut, ChevronRight, ArrowRight, Wallet, Car } from 'lucide-react';
import { navigateTo } from '../lib/navigation';

export default function CustomerPanel() {
  useEffect(() => {
    const userStr = localStorage.getItem('pickupr_user');
    if (!userStr) {
      navigateTo('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'customer') {
        navigateTo('/login');
      }
    } catch (e) {
      navigateTo('/login');
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'profile'>('upcoming');

  const [customer] = useState({
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+31 6 1234 5678',
    memberSince: '2025-11-20'
  });

  const [upcomingRides] = useState([
    { id: 'B-1029', origin: 'Amsterdam', destination: 'Keukenhof', date: '2026-06-12 09:00', status: 'Driver Assigned', price: '€160', driver: 'Taxi Utrecht B.V.', car: 'Mercedes E-Class' }
  ]);

  const [pastRides] = useState([
    { id: 'B-0982', origin: 'Amsterdam', destination: 'Paris', date: '2026-05-10 08:30', status: 'Completed', price: '€850', driver: 'VIP Chauffeurs' },
    { id: 'B-0850', origin: 'Schiphol', destination: 'Rotterdam', date: '2026-04-22 14:00', status: 'Completed', price: '€120', driver: 'Amsterdam Travel Serv.' },
  ]);

  return (
    <div className="pt-28 pb-16 min-h-screen bg-[#F8F9FA] font-sans text-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 mb-6 text-center shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
              <div className="w-20 h-20 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-zinc-900/20">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-1">{customer.name}</h2>
              <p className="text-sm text-zinc-500 mb-5">{customer.email}</p>
              <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> Premium Member
              </div>
            </div>

            <nav className="bg-white rounded-3xl border border-zinc-200/80 p-3 shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'upcoming' ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${activeTab === 'upcoming' ? 'text-zinc-300' : 'text-zinc-400'}`} /> Upcoming Rides
                </div>
                {upcomingRides.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{upcomingRides.length}</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
              >
                <CheckCircle className={`w-5 h-5 ${activeTab === 'history' ? 'text-zinc-300' : 'text-zinc-400'}`} /> Ride History
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
              >
                <Settings className={`w-5 h-5 ${activeTab === 'profile' ? 'text-zinc-300' : 'text-zinc-400'}`} /> Profile Settings
              </button>
              <div className="h-px bg-zinc-100 my-2 mx-2"></div>
              <button 
                onClick={() => { localStorage.removeItem('pickupr_user'); navigateTo('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
               >
                <LogOut className="w-5 h-5 text-zinc-400" /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'upcoming' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Upcoming Rides</h1>
                    <p className="text-zinc-500 mt-2">Manage your future bookings and transfer details.</p>
                  </div>
                  <button onClick={() => navigateTo('/')} className="bg-yellow-500 text-zinc-950 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Book New Ride
                  </button>
                </div>
                
                <div className="space-y-6">
                  {upcomingRides.map(ride => (
                    <div key={ride.id} className="bg-white border text-left border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                          <div className="inline-flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-zinc-600 uppercase border border-zinc-200/80">
                            Booking #{ride.id}
                          </div>
                          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm shadow-blue-500/10">
                            <Clock className="w-4 h-4" /> {ride.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 mb-8">
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-zinc-900 ring-4 ring-zinc-100"></div>
                             <div className="w-0.5 h-8 bg-zinc-200 rounded-full"></div>
                             <div className="w-4 h-4 rounded-full bg-transparent border-[3px] border-zinc-900 ring-4 ring-zinc-100"></div>
                          </div>
                          <div className="flex flex-col justify-between h-[4.5rem]">
                             <h3 className="text-xl font-bold text-zinc-900 leading-none">{ride.origin}</h3>
                             <h3 className="text-xl font-bold text-zinc-900 leading-none">{ride.destination}</h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-zinc-100">
                           <div>
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Date & Time</p>
                             <p className="text-sm font-semibold text-zinc-900 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-zinc-400" /> {ride.date}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Company</p>
                             <p className="text-sm font-semibold text-zinc-900 flex items-center gap-2"><Car className="w-4 h-4 text-zinc-400" /> {ride.driver}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Vehicle</p>
                             <p className="text-sm font-semibold text-zinc-900">{ride.car}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Price</p>
                             <p className="text-base font-bold text-zinc-900">{ride.price}</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-50 border-t border-zinc-100 p-4 sm:p-6 flex justify-end gap-3">
                         <button className="px-5 py-2.5 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-200/50 transition-colors text-sm">
                           Modify
                         </button>
                         <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors text-sm shadow-md shadow-zinc-900/10">
                           Track Driver
                         </button>
                      </div>
                    </div>
                  ))}
                  {upcomingRides.length === 0 && (
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-16 text-center text-zinc-500 shadow-sm flex flex-col items-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarIcon className="w-8 h-8 text-zinc-400" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">No upcoming rides</h3>
                      <p className="max-w-sm mb-8 relative">You haven't scheduled any future transfers yet. Ready to book your next trip?</p>
                      <button onClick={() => navigateTo('/')} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-colors">
                        Book a Ride Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Ride History</h1>
                  <p className="text-zinc-500 mt-2">Review your past trips, download invoices, and rate drivers.</p>
                </div>

                <div className="space-y-4">
                  {pastRides.map(ride => (
                    <div key={ride.id} className="bg-white border border-zinc-200/80 shadow-sm rounded-3xl p-6 sm:p-8 transition-all hover:shadow-md hover:border-zinc-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 text-sm">
                            <span className="font-bold text-zinc-500">#{ride.id}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span className="text-zinc-600 flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {ride.date}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span className="bg-green-100/50 text-green-700 font-bold px-2 py-0.5 rounded-md text-xs border border-green-200/50 flex flex-row items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2">
                              {ride.origin} <ArrowRight className="w-5 h-5 text-zinc-300 mx-1" /> {ride.destination}
                            </h3>
                          </div>
                          <p className="text-zinc-500 text-sm mt-3 flex items-center gap-1.5">
                            <Car className="w-4 h-4" /> Driven by <span className="font-medium text-zinc-700">{ride.driver}</span>
                          </p>
                        </div>
                        
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                           <div className="text-left md:text-right">
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Paid</p>
                             <p className="text-2xl font-bold text-zinc-900">{ride.price}</p>
                           </div>
                           <div className="flex gap-2">
                             <button className="bg-zinc-50 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/80 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                               <FileText className="w-4 h-4" /> PDF
                             </button>
                             <a href={`/rate/${ride.id}`} target="_blank" className="bg-yellow-500 text-zinc-950 hover:bg-yellow-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shadow-yellow-500/20">
                               <Star className="w-4 h-4" /> Rate
                             </a>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Profile Settings</h1>
                  <p className="text-zinc-500 mt-2">Manage your personal information and preferences.</p>
                </div>

                <div className="bg-white border border-zinc-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.02)] rounded-3xl p-8 sm:p-10">
                  <h3 className="text-lg font-bold text-zinc-900 mb-6">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Full Name</label>
                      <input type="text" defaultValue={customer.name} className="w-full border border-zinc-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-zinc-50/50 text-zinc-900 font-medium transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Email Address</label>
                      <input type="email" defaultValue={customer.email} className="w-full border border-zinc-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-zinc-50/50 text-zinc-900 font-medium transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">Phone Number</label>
                      <input type="tel" defaultValue={customer.phone} className="w-full border border-zinc-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-zinc-50/50 text-zinc-900 font-medium transition-all" />
                    </div>
                  </div>
                  
                  <hr className="my-10 border-zinc-100" />
                  
                  <h3 className="text-lg font-bold text-zinc-900 mb-6">Preferences</h3>
                  <div className="space-y-4 max-w-3xl">
                    <label className="flex items-center gap-3 p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                      <div>
                        <p className="font-bold text-zinc-900">Email Notifications</p>
                        <p className="text-sm text-zinc-500">Receive booking confirmations and invoices via email.</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                      <div>
                        <p className="font-bold text-zinc-900">SMS Updates</p>
                        <p className="text-sm text-zinc-500">Receive driver arrival updates via SMS.</p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-10 flex justify-end gap-3">
                    <button className="px-6 py-3 rounded-2xl font-bold text-zinc-600 hover:bg-zinc-100 transition-colors">
                      Cancel
                    </button>
                    <button className="bg-zinc-900 text-white font-bold py-3 px-8 rounded-2xl hover:bg-zinc-800 shadow-md shadow-zinc-900/10 transition-all">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

