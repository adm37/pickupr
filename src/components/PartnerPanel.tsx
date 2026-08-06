import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, DollarSign, Activity, CheckCircle, Clock, FileText, Upload, Download, Eye, File, XCircle, Car, Plus, Trash2, Users, Briefcase, LogOut, Star, Menu, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { navigateTo } from '../lib/navigation';

export default function PartnerPanel() {
  useEffect(() => {
    const userStr = localStorage.getItem('pickupr_user');
    if (!userStr) {
      navigateTo('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'partner') {
        navigateTo('/login');
      }
    } catch (e) {
      navigateTo('/login');
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'available' | 'upcoming' | 'history' | 'documents' | 'vehicles' | 'payments'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedUpcomingRide, setSelectedUpcomingRide] = useState<any>(null);
  const [selectedAvailableRideId, setSelectedAvailableRideId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('Week 24, 2026');

  // Calculate average rating
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    try {
      const storedRatings = JSON.parse(localStorage.getItem('customerRatings') || '[]');
      // Filter for this partner (assuming P-001 for now)
      const partnerRatings = storedRatings.filter((r: any) => r.partnerId === 'P-001');
      if (partnerRatings.length > 0) {
        const sum = partnerRatings.reduce((acc: number, cur: any) => acc + cur.score, 0);
        const avg = sum / partnerRatings.length;
        setAverageRating(avg);
        if (avg < 4.5) {
          setIsBlocked(true);
        }
      }
    } catch(e) {}
  }, []);

  const [vehicles, setVehicles] = useState([
    { id: 1, make: 'Mercedes-Benz', model: 'E-Class', year: '2023', licensePlate: 'AB-123-C', type: 'Sedan', passengers: 3, luggage: 2, status: 'Active' },
  ]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '', licensePlate: '', type: 'Sedan', passengers: 3, luggage: 2 });

  const mockEarnings = {
    today: '€ 150.00',
    thisWeek: '€ 850.00',
    thisMonth: '€ 3,450.00',
    totalRides: 42
  };

  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [upcomingRides, setUpcomingRides] = useState<any[]>([]);

  useEffect(() => {
    const fetchPartnerRides = async () => {
      try {
        const { data, error } = await supabase.from('bookings').select('*');
        let supabaseBookings: any[] = [];
        let acceptedBookings: any[] = [];
        
        if (!error && data) {
          const userStr = localStorage.getItem('pickupr_user');
          const user = userStr ? JSON.parse(userStr) : null;
          
          supabaseBookings = data.filter(b => b.status === 'Pending').map(b => ({
            id: b.id,
            date: b.date || 'N/A',
            time: b.time || 'N/A',
            pickup: b.pickup_location,
            dropoff: b.dropoff_location,
            price: `€ ${b.price}`,
            vehicle: b.vehicle || 'N/A',
            rideType: b.ride_type || 'Transfer',
            passengers: b.passengers || 1,
            luggage: b.luggage || 0
          }));
          
          acceptedBookings = data.filter(b => b.status === 'Accepted' && b.partner_id === user?.id).map(b => ({
            id: b.id,
            date: b.date || 'N/A',
            time: b.time || 'N/A',
            pickup: b.pickup_location,
            dropoff: b.dropoff_location,
            price: `€ ${b.price}`,
            status: 'Accepted',
            passengers: b.passengers || 1,
            luggage: b.luggage || 0,
            rideType: b.ride_type || 'Transfer'
          }));
        }

        const storedRides = JSON.parse(localStorage.getItem('partnerRides') || '[]');
        const combinedRides = [...supabaseBookings, ...storedRides];
        const uniqueRides = Array.from(new Map(combinedRides.map(item => [item.id, item])).values());
        setAvailableRides(uniqueRides);

        const storedAccepted = JSON.parse(localStorage.getItem('partnerAcceptedRides') || '[]');
        const combinedAccepted = [...acceptedBookings, ...storedAccepted];
        const uniqueAccepted = Array.from(new Map(combinedAccepted.map(item => [item.id, item])).values());
        setUpcomingRides(uniqueAccepted);
        
      } catch(e) {}
    };
    
    fetchPartnerRides();
  }, []);

  useEffect(() => {
    try {
      const storedAccepted = JSON.parse(localStorage.getItem('partnerAcceptedRides') || '[]');
      if (storedAccepted && storedAccepted.length > 0) {
        setUpcomingRides(prev => {
          const combined = [...storedAccepted, ...prev];
          return Array.from(new Map(combined.map(item => [item.id, item])).values());
        });
      }
    } catch(e) {}
  }, []);

  const handleAcceptRide = async (rideId: string) => {
    const rideToAccept = availableRides.find(r => r.id === rideId);
    if (!rideToAccept) return;
    
    // add to upcoming rides
    const acceptedRide = { ...rideToAccept, status: 'Accepted' };
    setUpcomingRides(prev => [acceptedRide, ...prev]);
    
    // remove from available rides
    setAvailableRides(prev => prev.filter(r => r.id !== rideId));

    try {
      const userStr = localStorage.getItem('pickupr_user');
      const user = userStr ? JSON.parse(userStr) : null;

      // If it doesn't look like a generated local localStorage ID
      if (rideId && !rideId.toString().startsWith('R-') && !rideId.toString().startsWith('B-')) {
        await supabase.from('bookings').update({ 
           status: 'Accepted', 
           partner_id: user?.id 
        }).eq('id', rideId);
      }

      // remove from localStorage partnerRides
      const storedRides = JSON.parse(localStorage.getItem('partnerRides') || '[]');
      const newStoredRides = storedRides.filter((r: any) => r.id !== rideId);
      localStorage.setItem('partnerRides', JSON.stringify(newStoredRides));

      // add to localStorage partnerAcceptedRides
      const storedAccepted = JSON.parse(localStorage.getItem('partnerAcceptedRides') || '[]');
      storedAccepted.unshift(acceptedRide);
      localStorage.setItem('partnerAcceptedRides', JSON.stringify(storedAccepted));
    } catch(e) {}
    setSelectedAvailableRideId(null);
  };

  const pastRides: any[] = [];

  const [documents, setDocuments] = useState([
    { id: 1, name: 'Taxi_License_2026.pdf', date: '2026-01-10', status: 'Approved' },
    { id: 2, name: 'Insurance_Policy.pdf', date: '2026-02-15', status: 'Approved' },
    { id: 3, name: 'Vehicle_Registration.pdf', date: '2026-06-01', status: 'Pending' },
  ]);

  const statsCards = [
    { title: "Today's Earnings", value: mockEarnings.today, icon: DollarSign, trend: "+12%" },
    { title: "This Week", value: mockEarnings.thisWeek, icon: Activity, trend: "+5%" },
    { title: "This Month", value: mockEarnings.thisMonth, icon: Calendar, trend: "+18%" },
    { title: "Driver Rating", value: `★ ${averageRating.toFixed(1)}`, icon: Star, trend: "" },
  ];

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    setVehicles([...vehicles, { id: newId, ...newVehicle, status: 'Active' }]);
    setShowAddVehicle(false);
    setNewVehicle({ make: '', model: '', year: '', licensePlate: '', type: 'Sedan', passengers: 3, luggage: 2 });
  };

  const mockWeeklyPayouts = [
    { 
      week: 'Week 24, 2026', 
      totalRevenue: 480.00, 
      commission: 72.00, 
      netPayout: 408.00, 
      status: 'Pending',
      rides: [
        { id: 'R-1', date: '2026-06-01', route: 'Utrecht - Schiphol', price: '150.00', payout: '127.50' },
        { id: 'R-2', date: '2026-06-03', route: 'Schiphol - Utrecht', price: '150.00', payout: '127.50' },
        { id: 'R-3', date: '2026-06-05', route: 'Utrecht - Amsterdam', price: '180.00', payout: '153.00' }
      ]
    },
    { 
      week: 'Week 23, 2026', 
      totalRevenue: 650.00, 
      commission: 97.50, 
      netPayout: 552.50, 
      status: 'Paid',
      rides: [
        { id: 'R-4', date: '2026-05-25', route: 'Amsterdam - Rotterdam', price: '200.00', payout: '170.00' },
        { id: 'R-5', date: '2026-05-26', route: 'Rotterdam - Den Haag', price: '150.00', payout: '127.50' },
        { id: 'R-6', date: '2026-05-28', route: 'Utrecht - Schiphol', price: '300.00', payout: '255.00' }
      ]
    }
  ];

  const selectedPayout = mockWeeklyPayouts.find(p => p.week === selectedWeek) || mockWeeklyPayouts[0];

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(24, 24, 27);
    doc.text("Wait VIP", 14, 20);

    doc.setFontSize(16);
    doc.text(`Earnings Report: ${selectedPayout.week}`, 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(113, 113, 122);
    doc.text(`Total Customer Payments: EUR ${selectedPayout.totalRevenue.toFixed(2)}`, 14, 40);
    doc.text(`Platform Fee (15%): EUR ${selectedPayout.commission.toFixed(2)}`, 14, 46);
    
    doc.setTextColor(22, 163, 74);
    doc.text(`Net Payout to You: EUR ${selectedPayout.netPayout.toFixed(2)}`, 14, 52);
    
    doc.setTextColor(113, 113, 122);
    doc.text(`Status: ${selectedPayout.status}`, 14, 58);

    const tableData = selectedPayout.rides.map((ride: any) => [
      ride.id,
      ride.date,
      ride.route,
      `EUR ${ride.price}`,
      `EUR ${ride.payout}`,
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['ID', 'Date', 'Route', 'Customer Price', 'Your Earnings']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [24, 24, 27] },
    });

    const filename = `earnings_report_${selectedPayout.week.replace(/[\s,]+/g, '_').toLowerCase()}.pdf`;
    doc.save(filename);
  };

  const sortedUpcomingRides = [...upcomingRides].sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  return (
    <div className="flex bg-zinc-50 min-h-screen pt-20 text-zinc-950 font-sans">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-20 left-0 right-0 bg-white border-b border-zinc-200 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="font-bold text-zinc-900 capitalize">{activeTab}</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:text-zinc-900">
          {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-[8.5rem] md:top-20 w-64 h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5rem)] bg-white border-r border-zinc-200 overflow-y-auto z-30 transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Partner Portal</h2>
          <p className="text-sm text-zinc-500">Taxi Utrecht B.V.</p>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: Activity },
            { id: 'profile', name: 'My Profile', icon: Eye },
            { id: 'available', name: 'Available Rides', icon: Clock },
            { id: 'upcoming', name: 'Upcoming Rides', icon: Calendar },
            { id: 'history', name: 'Ride History', icon: CheckCircle },
            { id: 'vehicles', name: 'Vehicles', icon: Car },
            { id: 'documents', name: 'Documents', icon: FileText },
            { id: 'payments', name: 'Payments', icon: DollarSign },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-yellow-50 text-yellow-700' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-600' : 'text-zinc-400'}`} />
                {item.name}
              </button>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-zinc-200">
            <button
              onClick={() => { localStorage.removeItem('pickupr_user'); navigateTo('/'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              Log out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full md:ml-64 p-6 lg:p-8 mt-14 md:mt-0 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {isBlocked ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center mt-10">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-red-700 mb-2">Account Blocked</h2>
              <p className="text-red-600 text-lg max-w-lg mx-auto">
                Your average customer rating has dropped below the minimum requirement of 4.5 stars (Current: {averageRating.toFixed(1)}).
                Please contact support to discuss your account status.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
                    <p className="text-zinc-500 mt-1">Welcome back, track your earnings and activity here.</p>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statsCards.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      {stat.trend && (
                        <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded-full">
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-zinc-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Upcoming preview */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-zinc-900">Next Upcoming Ride</h2>
                    <button onClick={() => setActiveTab('upcoming')} className="text-sm text-yellow-600 font-medium hover:underline">View all</button>
                  </div>
                  {sortedUpcomingRides.length > 0 ? (
                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">{sortedUpcomingRides[0].rideType}</span>
                            <span className="text-xs font-semibold text-yellow-600 uppercase">{sortedUpcomingRides[0].date} &bull; {sortedUpcomingRides[0].time}</span>
                          </div>
                          <p className="font-bold text-zinc-900 mt-1 leading-tight">
                            {sortedUpcomingRides[0].pickup} 
                            {sortedUpcomingRides[0].waypoints && sortedUpcomingRides[0].waypoints.length > 0 && <span className="text-zinc-500 font-normal"> &rarr; {sortedUpcomingRides[0].waypoints.length} stop(s) </span>} 
                            {sortedUpcomingRides[0].rideType !== 'Hourly Driver' && <> &rarr; {sortedUpcomingRides[0].dropoff}</>}
                          </p>
                          <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 mt-2">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {sortedUpcomingRides[0].passengers}</span>
                            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {sortedUpcomingRides[0].luggage}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-base">€ {(parseFloat(sortedUpcomingRides[0].price.replace('€ ', '').replace(',','')) * 0.85).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No upcoming rides.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">My Profile</h1>
                <p className="text-zinc-500 mt-1">Manage your company and personal details.</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <h2 className="text-lg font-bold text-zinc-900">Company Details</h2>
                  <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">Edit</button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Company Name</label>
                    <p className="font-semibold text-zinc-900">Taxi Utrecht B.V.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Contact Person</label>
                    <p className="font-semibold text-zinc-900">Joost Bakker</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Phone Number</label>
                    <p className="font-semibold text-zinc-900">+31 6 12345678</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Email Address</label>
                    <p className="font-semibold text-zinc-900">info@taxiutrecht.nl</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Chamber of Commerce (KVK)</label>
                    <p className="font-semibold text-zinc-900">12345678</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Tax Number</label>
                    <p className="font-semibold text-zinc-900">NL123456789B01</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Bank Account Number (IBAN)</label>
                    <p className="font-semibold text-zinc-900">NL99 INGB 0123 4567 89</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">BIC Code</label>
                    <p className="font-semibold text-zinc-900">INGBNL2A</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'available' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Available Rides</h1>
                <p className="text-zinc-500 mt-1">Accept open rides in your area.</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                      <th className="p-4 font-medium text-left">Date & Time</th>
                      <th className="p-4 font-medium text-left">Ride Info</th>
                      <th className="p-4 font-medium text-left">Route</th>
                      <th className="p-4 font-medium text-left">Earnings</th>
                      <th className="p-4 font-medium text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableRides.map((ride, i) => {
                      const priceVal = parseFloat(ride.price.replace('€ ', '').replace(',', ''));
                      const earnings = (priceVal * 0.85).toFixed(2);
                      return (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                        <td className="p-4 text-sm font-medium text-zinc-900">{ride.date} <br/><span className="text-zinc-500 font-normal">{ride.time}</span></td>
                        <td className="p-4 text-sm">
                           <div className="flex flex-col gap-1.5 items-start">
                             <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">{ride.rideType}</span>
                             <div className="flex items-center gap-3 text-zinc-500 font-medium">
                               <span className="flex items-center gap-1" title="Passengers"><Users className="w-3.5 h-3.5" /> {ride.passengers}</span>
                               <span className="flex items-center gap-1" title="Luggage"><Briefcase className="w-3.5 h-3.5" /> {ride.luggage}</span>
                             </div>
                             <span className="text-zinc-400 text-xs">{ride.vehicle}</span>
                           </div>
                        </td>
                        <td className="p-4 text-sm font-semibold text-zinc-900 leading-tight">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-zinc-500 text-xs font-normal">
                              <div className="w-2 h-2 rounded-full border-2 border-zinc-300"></div>
                              <span>{ride.pickup}</span>
                            </div>
                            
                            {ride.waypoints && ride.waypoints.map((wp: any, wIdx: number) => (
                              <div key={wIdx} className="flex pl-1">
                                <div className="border-l-2 border-dashed border-zinc-200 pl-3 py-1 flex items-start flex-col justify-center">
                                  <span className="text-zinc-900 font-medium">{wp.location}</span>
                                  {wp.waitTime > 0 && <span className="text-[10px] text-zinc-500">Wait: {wp.waitTime} hr</span>}
                                </div>
                              </div>
                            ))}

                            {!ride.waypoints || ride.waypoints.length === 0 ? (
                               ride.rideType === 'Hourly Driver' ? null : <span className="text-zinc-400 font-normal">&rarr; {ride.dropoff}</span>
                            ) : (
                              <div className="flex pl-1 pt-1">
                                <div className="w-2 h-2 rounded-sm border-2 border-zinc-800 -ml-1 mt-1 shrink-0 bg-white"></div>
                                <span className="pl-3 font-semibold text-zinc-900">{ride.dropoff}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <p className="font-bold text-green-600 text-base">€ {earnings}</p>
                        </td>
                        <td className="p-4 text-sm">
                          <button onClick={() => handleAcceptRide(ride.id)} className="bg-yellow-500 text-zinc-950 px-5 py-2 rounded-lg font-bold text-xs hover:bg-yellow-400 shadow-sm border border-yellow-400 transition-colors">Accept Ride</button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'upcoming' && (
            <>
              {selectedUpcomingRide ? (
                <div>
                  <button 
                    onClick={() => setSelectedUpcomingRide(null)}
                    className="mb-6 flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    &larr; Back to upcoming rides
                  </button>
                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap gap-4 items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-3">
                          Ride Details
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] transform -translate-y-0.5">
                            {selectedUpcomingRide.rideType}
                          </span>
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">ID: {selectedUpcomingRide.id}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {selectedUpcomingRide.status}
                      </span>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Route Information</h3>
                          <div className="relative pl-6 space-y-6 border-l-2 border-zinc-100 ml-3">
                            <div className="relative">
                              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-zinc-900 rounded-full"></div>
                              <p className="text-xs font-semibold text-zinc-500 mb-1">{selectedUpcomingRide.date} &bull; {selectedUpcomingRide.time}</p>
                              <p className="font-bold text-zinc-900">{selectedUpcomingRide.pickup}</p>
                            </div>

                            {selectedUpcomingRide.waypoints && selectedUpcomingRide.waypoints.map((wp: any, wIdx: number) => (
                              <div key={wIdx} className="relative">
                                <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-zinc-400 rounded-full"></div>
                                <p className="font-bold text-zinc-900">{wp.location}</p>
                                {wp.waitTime > 0 && <p className="text-xs text-zinc-500">Wait Time: {wp.waitTime} hour(s)</p>}
                              </div>
                            ))}

                            {selectedUpcomingRide.rideType !== 'Hourly Driver' && (
                              <div className="relative">
                                <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-yellow-500 rounded-full"></div>
                                <p className="font-bold text-zinc-900">{selectedUpcomingRide.dropoff}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Passenger Information</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-zinc-500 mb-0.5">Name</p>
                              <p className="font-semibold text-zinc-900">John Doe (Mock)</p>
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500 mb-0.5">Phone</p>
                              <p className="font-semibold text-zinc-900">+31 6 1234 5678</p>
                            </div>
                            {(selectedUpcomingRide as any).flightNumber && (
                              <div>
                                <p className="text-sm text-zinc-500 mb-0.5">Flight Number (Track Status)</p>
                                <p className="font-semibold text-zinc-900 inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded uppercase tracking-wider mt-1">{(selectedUpcomingRide as any).flightNumber}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-zinc-500 mb-0.5">Passengers</p>
                              <p className="font-semibold text-zinc-900 flex items-center gap-1"><Users className="w-4 h-4 text-zinc-500" /> {selectedUpcomingRide.passengers} {selectedUpcomingRide.passengers === 1 ? 'Person' : 'Persons'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500 mb-0.5">Luggage</p>
                              <p className="font-semibold text-zinc-900 flex items-center gap-1"><Briefcase className="w-4 h-4 text-zinc-500" /> {selectedUpcomingRide.luggage} {selectedUpcomingRide.luggage === 1 ? 'Suitcase' : 'Suitcases'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Payment Details</h3>
                          <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Base Fare</span>
                              <span className="font-medium text-zinc-900">{selectedUpcomingRide.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Service Fee (15%)</span>
                              <span className="font-medium text-red-600">- € {(parseFloat(selectedUpcomingRide.price.replace('€ ', '')) * 0.15).toFixed(2)}</span>
                            </div>
                            <div className="pt-3 mt-3 border-t border-zinc-200 flex justify-between items-center">
                              <span className="font-bold text-zinc-900">Your Earnings</span>
                              <span className="font-bold text-xl text-green-600">€ {(parseFloat(selectedUpcomingRide.price.replace('€ ', '')) * 0.85).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors">
                            Contact Customer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">Upcoming Rides</h1>
                    <p className="text-zinc-500 mt-1">Rides you have accepted and are scheduled to drive.</p>
                  </div>
                  <div className="space-y-4">
                    {sortedUpcomingRides.map((ride, i) => (
                      <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs font-bold leading-none">{ride.date.split('-')[2]}</span>
                            <span className="text-[10px] font-medium uppercase mt-0.5">Jun</span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs font-semibold text-zinc-500 mb-1">
                              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">{ride.rideType}</span>
                              <span>{ride.time}</span>
                              <div className="flex items-center gap-3 ml-1 md:ml-2 border-l border-zinc-200 pl-2 md:pl-3">
                                <span className="flex items-center gap-1" title="Passengers"><Users className="w-3.5 h-3.5" /> {ride.passengers}</span>
                                <span className="flex items-center gap-1" title="Luggage"><Briefcase className="w-3.5 h-3.5" /> {ride.luggage}</span>
                              </div>
                            </div>
                            <div className="font-bold text-zinc-900 text-lg leading-tight mt-1 flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-normal">
                                <div className="w-2.5 h-2.5 rounded-full border-[3px] border-zinc-300"></div>
                                <span>{ride.pickup}</span>
                              </div>
                              
                              {ride.waypoints && ride.waypoints.map((wp: any, wIdx: number) => (
                                <div key={wIdx} className="flex pl-1">
                                  <div className="border-l-[3px] border-dashed border-zinc-200 pl-4 py-1.5 flex items-start flex-col justify-center">
                                    <span className="text-zinc-900 font-semibold text-base">{wp.location}</span>
                                    {wp.waitTime > 0 && <span className="text-xs text-zinc-400 font-medium">Wait: {wp.waitTime} hour(s)</span>}
                                  </div>
                                </div>
                              ))}

                              {!ride.waypoints || ride.waypoints.length === 0 ? (
                                ride.rideType === 'Hourly Driver' ? null :
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className="text-zinc-300">&rarr;</span> {ride.dropoff}
                                </div>
                              ) : (
                                <div className="flex pl-1 pt-1 opacity-90">
                                  <div className="w-2.5 h-2.5 rounded-sm border-[3px] border-zinc-800 -ml-[1.5px] mt-2 shrink-0 bg-white"></div>
                                  <span className="pl-4 font-bold text-zinc-900 text-lg">{ride.dropoff}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {ride.status}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium my-auto">ID: {ride.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-2 text-right">
                          <div>
                            <p className="font-bold text-xl text-green-600">€ {(parseFloat(ride.price.replace('€ ', '').replace(',', '')) * 0.85).toFixed(2)}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedUpcomingRide(ride)}
                            className="text-sm font-medium text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-800"
                          >
                            View Ride
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900">Ride History</h1>
                  <p className="text-zinc-500 mt-1">Completed rides and invoices.</p>
                </div>
                <div className="flex gap-2">
                  <select className="border border-zinc-200 bg-white rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 outline-none">
                    <option>May 2026</option>
                    <option>April 2026</option>
                    <option>March 2026</option>
                  </select>
                  <button className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                      <th className="p-4 font-medium">Date & Time</th>
                      <th className="p-4 font-medium">Route</th>
                      <th className="p-4 font-medium">Earnings</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastRides.map((ride, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                        <td className="p-4 text-sm font-medium text-zinc-900">{ride.date} <span className="text-zinc-500 font-normal ml-2">{ride.time}</span></td>
                        <td className="p-4 text-sm text-zinc-700">{ride.pickup} {ride.rideType !== 'Hourly Driver' && <>&rarr; {ride.dropoff}</>}</td>
                        <td className="p-4 text-sm font-semibold text-zinc-900">{ride.price}</td>
                        <td className="p-4 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 bg-opacity-50">
                            {ride.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm flex gap-3">
                          <button className="text-zinc-500 hover:text-yellow-600 flex items-center gap-1.5 transition-colors">
                            <FileText className="w-4 h-4" /> <span className="font-medium">PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'vehicles' && (
            <>
              <div className="mb-8 flex justify-between items-end gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900">Vehicles</h1>
                  <p className="text-zinc-500 mt-1">Manage your fleet.</p>
                </div>
                {vehicles.length === 0 && (
                  <button 
                    onClick={() => setShowAddVehicle(!showAddVehicle)}
                    className="bg-yellow-500 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Vehicle
                  </button>
                )}
              </div>

              {showAddVehicle && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm mb-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6">Add New Vehicle</h2>
                  <form onSubmit={handleAddVehicle} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Make (Brand) *</label>
                        <input 
                          type="text" required 
                          value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder:text-zinc-400" 
                          placeholder="e.g. Mercedes-Benz" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Model *</label>
                        <input 
                          type="text" required 
                          value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder:text-zinc-400" 
                          placeholder="e.g. E-Class" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Build Year *</label>
                        <input 
                          type="text" required 
                          value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder:text-zinc-400" 
                          placeholder="YYYY" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">License Plate *</label>
                        <input 
                          type="text" required 
                          value={newVehicle.licensePlate} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors placeholder:text-zinc-400" 
                          placeholder="ABC-123" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Vehicle Type *</label>
                        <div className="relative">
                          <select 
                            value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors appearance-none"
                          >
                            <option value="Sedan">Sedan (Max 4 pax)</option>
                            <option value="Van">Van (Max 8 pax)</option>
                            <option value="Luxury Sedan">Luxury Sedan</option>
                            <option value="EV">Electric Vehicle</option>
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <XCircle className="w-4 h-4 text-zinc-400 transform rotate-45 opacity-0" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Passengers *</label>
                        <input 
                          type="number" min="1" max="8" required 
                          value={newVehicle.passengers} onChange={e => setNewVehicle({...newVehicle, passengers: parseInt(e.target.value) || 1})}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Luggage *</label>
                        <input 
                          type="number" min="0" max="10" required 
                          value={newVehicle.luggage} onChange={e => setNewVehicle({...newVehicle, luggage: parseInt(e.target.value) || 0})}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                      <button 
                        type="button" 
                        onClick={() => setShowAddVehicle(false)} 
                        className="px-4 py-2 rounded-lg font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 rounded-lg font-medium text-zinc-950 bg-yellow-500 hover:bg-yellow-400 transition-colors"
                      >
                        Save Vehicle
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                {vehicles.length > 0 ? (
                  <>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                          <th className="p-4 font-medium">Vehicle</th>
                          <th className="p-4 font-medium">License Plate</th>
                          <th className="p-4 font-medium">Type</th>
                          <th className="p-4 font-medium">Cap.</th>
                          <th className="p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => (
                          <tr key={v.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                            <td className="p-4 text-sm">
                              <span className="font-bold text-zinc-900">{v.make} {v.model}</span>
                              <span className="text-zinc-500 block text-xs mt-0.5">{v.year}</span>
                            </td>
                            <td className="p-4 text-sm font-mono text-zinc-700 bg-zinc-100/50 rounded inline-block m-4 border border-zinc-200">{v.licensePlate}</td>
                            <td className="p-4 text-sm text-zinc-700">{v.type}</td>
                            <td className="p-4 text-sm text-zinc-500">
                              {v.passengers} Pax <br/> {v.luggage} Lugg
                            </td>
                            <td className="p-4 text-sm">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {v.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-sm text-zinc-500 text-center">
                      <span className="font-medium text-zinc-700">Note:</span> You can only register 1 vehicle. To change or remove your current vehicle, please contact the admin.
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-zinc-500">
                    <Car className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                    <p className="font-medium text-zinc-900">No vehicles added yet</p>
                    <p className="text-sm mt-1">Add your first vehicle to start receiving rides.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Documents</h1>
                <p className="text-zinc-500 mt-1">Upload and manage your required documents and licenses.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Upload Zone */}
                <div className="col-span-1 md:col-span-3 bg-white border-2 border-dashed border-zinc-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 mb-1">Upload exactly what you need</h3>
                  <p className="text-zinc-500 text-sm mb-6 max-w-sm">Upload PDF, JPG or PNG. Max size 5MB. Ensure all documents are clearly legible.</p>
                  <label className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-zinc-800 cursor-pointer transition-colors">
                    Browse files
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <div className="p-4 border-b border-zinc-200">
                  <h3 className="font-bold text-zinc-900">Uploaded Documents</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 border border-zinc-200">
                          <File className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{doc.name}</p>
                          <p className="text-xs text-zinc-500">Uploaded {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${doc.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {doc.status}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <button className="hover:text-zinc-900 p-1"><Eye className="w-4 h-4" /></button>
                          <button className="hover:text-red-600 p-1"><XCircle className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="mb-8 flex justify-between items-end gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900">Payments</h1>
                  <p className="text-zinc-500 mt-1">Review your weekly earnings and payouts.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                   <select 
                     value={selectedWeek}
                     onChange={(e) => setSelectedWeek(e.target.value)}
                     className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 outline-none hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
                   >
                     {mockWeeklyPayouts.map(p => (
                       <option key={p.week} value={p.week}>{p.week}</option>
                     ))}
                   </select>
                   <button onClick={generatePDF} className="bg-zinc-900 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm">
                     <Download className="w-4 h-4" /> Download PDF
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl">
                  <h3 className="text-sm font-medium text-zinc-500 mb-2">Total Customer Payments</h3>
                  <p className="text-3xl font-bold text-zinc-900">€ {selectedPayout.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl">
                  <h3 className="text-sm font-medium text-zinc-500 mb-2">Platform Fee (15%)</h3>
                  <p className="text-3xl font-bold text-red-600">- € {selectedPayout.commission.toFixed(2)}</p>
                </div>
                <div className="bg-zinc-900 p-6 border border-zinc-800 shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-400">Net Payout to You</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedPayout.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {selectedPayout.status}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">€ {selectedPayout.netPayout.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-900">Rides in {selectedPayout.week}</h3>
                  <p className="text-sm text-zinc-500">Breakdown of all completed rides over this period.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-4 font-semibold text-sm text-zinc-600">ID</th>
                        <th className="p-4 font-semibold text-sm text-zinc-600">Date</th>
                        <th className="p-4 font-semibold text-sm text-zinc-600">Route</th>
                        <th className="p-4 font-semibold text-sm text-zinc-600">Customer Price</th>
                        <th className="p-4 font-semibold text-sm text-zinc-600">Your Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPayout.rides.map((ride: any) => (
                        <tr key={ride.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                          <td className="p-4 text-sm font-medium text-zinc-900">{ride.id}</td>
                          <td className="p-4 text-sm text-zinc-600">{ride.date}</td>
                          <td className="p-4 text-sm text-zinc-900">{ride.route}</td>
                          <td className="p-4 text-sm font-medium text-zinc-900">€ {ride.price}</td>
                          <td className="p-4 text-sm font-bold text-green-600">€ {ride.payout}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
