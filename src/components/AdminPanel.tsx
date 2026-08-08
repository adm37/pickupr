import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { Calendar, Users, DollarSign, Activity, CheckCircle, Clock, XCircle, Search, LayoutDashboard, Building2, Wallet, Settings as SettingsIcon, MapPin, User, Car, Plus, ArrowLeft, Download, Ticket, Star, ChevronDown, Trash2, Menu, X } from 'lucide-react';
import BookingMap from './BookingMap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTrackingEvents, TrackingEvent, clearTrackingEvents } from '../lib/tracking';
import { navigateTo } from '../lib/navigation';

export default function AdminPanel() {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [selectedTrackingIp, setSelectedTrackingIp] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const data = await getTrackingEvents();
        setTrackingEvents(data);
      } catch(e) {}
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 2000); // refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('pickupr_user');
    if (!userStr) {
      navigateTo('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        navigateTo('/login');
      }
    } catch (e) {
      navigateTo('/login');
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'bookings' | 'quotes'>('bookings');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnersExpanded, setPartnersExpanded] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);


  const [coupons, setCoupons] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('adminCoupons') || '[]'); } catch(e) { return []; }
  });
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percent' });

  const [sedanPrice, setSedanPrice] = useState(localStorage.getItem('sedanPrice') || '2.50');
  const [vanPrice, setVanPrice] = useState(localStorage.getItem('vanPrice') || '3.50');
  const [luxurySedanPrice, setLuxurySedanPrice] = useState(localStorage.getItem('luxurySedanPrice') || '4.50');

  const [hourlySedanPrice, setHourlySedanPrice] = useState(localStorage.getItem('hourlySedanPrice') || '50');
  const [hourlyVanPrice, setHourlyVanPrice] = useState(localStorage.getItem('hourlyVanPrice') || '75');
  const [hourlyLuxuryPrice, setHourlyLuxuryPrice] = useState(localStorage.getItem('hourlyLuxuryPrice') || '100');
  
  const [minimumPrice, setMinimumPrice] = useState(localStorage.getItem('minimumPrice') || '115');
  const [minimumDistance, setMinimumDistance] = useState(localStorage.getItem('minimumDistance') || '30');

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(localStorage.getItem('googleMapsApiKey') || '');
  const [mollieApiKey, setMollieApiKey] = useState(localStorage.getItem('mollieApiKey') || '');

  const [exitPopupEnabled, setExitPopupEnabled] = useState(false);
  const [exitPopupTitle, setExitPopupTitle] = useState('Wait! Before you leave...');
  const [exitPopupMessage, setExitPopupMessage] = useState('Book your ride now and get 10% off your first trip with this exclusive discount code.');
  const [exitPopupCode, setExitPopupCode] = useState('SAVE10');
  const [exitPopupButton, setExitPopupButton] = useState('Claim Discount & Book');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/mollie');
        if (res.ok) {
          const data = await res.json();
          if (data.key) {
            setMollieApiKey(data.key);
            localStorage.setItem('mollieApiKey', data.key);
          }
        }
      } catch (e) {
        console.error('Failed to fetch mollie settings', e);
      }
      
      try {
        const res = await fetch('/api/settings/generic/EXIT_INTENT_POPUP');
        if (res.ok) {
          const data = await res.json();
          if (data && data.value) {
            let parsed = data.value;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            
            if (parsed.enabled !== undefined) setExitPopupEnabled(parsed.enabled);
            if (parsed.title) setExitPopupTitle(parsed.title);
            if (parsed.message) setExitPopupMessage(parsed.message);
            if (parsed.discountCode) setExitPopupCode(parsed.discountCode);
            if (parsed.buttonText) setExitPopupButton(parsed.buttonText);
          }
        }
      } catch (e) {}
      
    };
    fetchSettings();
  }, []);

  const handleSaveExitPopupSettings = async () => {
    try {
      const value = {
        enabled: exitPopupEnabled,
        title: exitPopupTitle,
        message: exitPopupMessage,
        discountCode: exitPopupCode,
        buttonText: exitPopupButton
      };
      
      const res = await fetch('/api/settings/generic/EXIT_INTENT_POPUP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      if (res.ok) {
        alert('Exit Intent Popup settings saved!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving.');
    }
  };

  const handleSaveMollieKey = async () => {
    if (!mollieApiKey.trim()) return;
    localStorage.setItem('mollieApiKey', mollieApiKey);
    try {
      const res = await fetch('/api/settings/mollie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: mollieApiKey })
      });
      if (res.ok) {
        alert('Mollie configuration saved!');
      } else {
        alert('Failed to save Mollie key.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred.');
    }
  };

  const handleSavePrices = () => {
    localStorage.setItem('sedanPrice', sedanPrice);
    localStorage.setItem('vanPrice', vanPrice);
    localStorage.setItem('luxurySedanPrice', luxurySedanPrice);
    localStorage.setItem('hourlySedanPrice', hourlySedanPrice);
    localStorage.setItem('hourlyVanPrice', hourlyVanPrice);
    localStorage.setItem('hourlyLuxuryPrice', hourlyLuxuryPrice);
    localStorage.setItem('minimumPrice', minimumPrice);
    localStorage.setItem('minimumDistance', minimumDistance);
    alert('Fares saved!');
  };

  const handleSaveMapApiKey = () => {
    localStorage.setItem('googleMapsApiKey', googleMapsApiKey);
    window.dispatchEvent(new Event('maps_key_updated'));
    alert('Google Maps API key saved!');
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    const added = [...coupons, { ...newCoupon, id: Date.now().toString() }];
    setCoupons(added);
    localStorage.setItem('adminCoupons', JSON.stringify(added));
    setShowAddCoupon(false);
    setNewCoupon({ code: '', discount: '', type: 'percent' });
  };

  const handleDeleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    localStorage.setItem('adminCoupons', JSON.stringify(updated));
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Bookings', icon: Calendar },
    { name: 'Customers', icon: Users },
    { name: 'Financial', icon: Wallet },
    { name: 'Tracking', icon: Activity },
    { name: 'Coupons', icon: Ticket },
    { name: 'Settings', icon: SettingsIcon },
  ];

  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  const parseBookingAmount = (value: unknown) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value ?? '0').replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(normalized) || 0;
  };

  const normalizePaymentStatus = (value: unknown) => String(value || 'pending').trim().toLowerCase();

  const getPaymentStatusLabel = (value: unknown) => {
    const normalized = normalizePaymentStatus(value);
    if (normalized === 'paid') return 'Paid';
    if (normalized === 'canceled') return 'Canceled';
    if (normalized === 'failed') return 'Failed';
    if (normalized === 'expired') return 'Expired';
    return 'Pending';
  };

  const getPaymentStatusBadgeClass = (value: unknown) => {
    const normalized = normalizePaymentStatus(value);
    if (normalized === 'paid') return 'bg-green-50 text-green-700 border-green-200';
    if (normalized === 'failed' || normalized === 'canceled' || normalized === 'expired') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const mapSupabaseBooking = (b: any) => ({
    id: String(b.id),
    name: b.customer_name || 'N/A',
    route: b.ride_type === 'Hourly Driver' ? `${b.pickup_location} (Hourly)` : `${b.pickup_location} to ${b.dropoff_location}`,
    waypoints: [],
    date: b.date || 'N/A',
    time: b.time || 'N/A',
    status: b.status || 'Pending',
    paymentStatus: normalizePaymentStatus(b.payment_status),
    price: `€ ${parseBookingAmount(b.price).toFixed(2)}`,
    vehicle: b.vehicle || 'N/A',
    passengers: b.passengers || 1,
    paymentMethod: b.payment_method,
    flightNumber: b.flight_number,
    client: { name: b.customer_name, phone: b.customer_phone, email: b.customer_email },
    origin: b.pickup_location,
    destination: b.dropoff_location,
    partnerId: b.partner_id || null,
  });

  const fetchBookings = async () => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured for admin bookings.');
      setRecentBookings([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load bookings from Supabase:', error);
        setRecentBookings([]);
        return;
      }

      const supabaseBookings = (data || []).map(mapSupabaseBooking);
      setRecentBookings(supabaseBookings);
    } catch (e) {
      console.error(e);
      setRecentBookings([]);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setRecentBookings([]);
      return;
    }

    fetchBookings();

    const bookingsChannel = supabase
      .channel('admin-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const handleDeleteBooking = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const normalizedId = String(id);
    if (window.confirm('Are you sure you want to delete this booking?')) {
      // Optimitically update UI
      const updated = recentBookings.filter(b => String(b.id) !== normalizedId);
      setRecentBookings(updated);
      
      if (selectedBookingId === normalizedId) {
        setSelectedBookingId(null);
      }

      // Try to delete from Supabase
      try {
        const { error } = await supabase.from('bookings').delete().eq('id', normalizedId);
        if (error) {
          console.error("Error deleting from Supabase", error);
          fetchBookings();
        }
      } catch (err) {
        console.error("Error deleting from Supabase", err);
        fetchBookings();
      }
    }
  };



  const calculateSelectedBooking = () => {
    if (!selectedBookingId) return null;

    const dynamicBooking = recentBookings.find(b => b.id === selectedBookingId);
    if (dynamicBooking) {
       const isHourly = dynamicBooking.route?.includes('hours') || dynamicBooking.route?.includes('Hourly');
       const origin = isHourly ? dynamicBooking.route : dynamicBooking.route?.split(' to ')[0];
       const dst = isHourly ? 'N/A' : (dynamicBooking.route?.split(' to ')[1] || dynamicBooking.destination);
       return {
         ...dynamicBooking,
         id: dynamicBooking.id,
         client: dynamicBooking.client || { name: dynamicBooking.name, phone: dynamicBooking.client?.phone || 'N/A', email: dynamicBooking.client?.email || 'N/A' },
         status: dynamicBooking.status,
         price: dynamicBooking.price,
         date: dynamicBooking.date,
         time: dynamicBooking.time || '12:00',
         vehicle: dynamicBooking.vehicle || 'Assigned Vehicle',
         passengers: dynamicBooking.passengers || 1,
         origin: dynamicBooking.origin || origin || 'Unknown',
         originCoords: dynamicBooking.originCoords || { lat: 52.3676, lng: 4.9041 },
         destination: dynamicBooking.destination || dst || 'Unknown',
         destinationCoords: dynamicBooking.destinationCoords || { lat: 51.2093, lng: 3.2247 },
         waypoints: (dynamicBooking as any).waypoints || [],
         paymentMethod: (dynamicBooking as any).paymentMethod || 'Unknown',
         flightNumber: (dynamicBooking as any).flightNumber || 'N/A',
         notes: (dynamicBooking as any).notes || ''
       };
    }
    return null;
  };

  const selectedBooking = calculateSelectedBooking();

  const getMetrics = () => {
    const upcomingTrips = recentBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Accepted').length;
    
    const clients = new Set();
    recentBookings.forEach(b => {
      if (b.client?.email && b.client.email !== 'N/A') {
        clients.add(b.client.email);
      } else if (b.client?.name && b.client.name !== 'N/A') {
        clients.add(b.client.name);
      } else if (b.name && b.name !== 'N/A') {
        clients.add(b.name);
      }
    });

    let revenue = 0;
    recentBookings.forEach(b => {
       const priceStr = String(b.price || '0').replace(/[^0-9.]/g, '');
       revenue += parseFloat(priceStr) || 0;
    });

    let revenueFormatted = `€${Math.round(revenue)}`;
    if (revenue >= 1000) {
       revenueFormatted = `€${(revenue/1000).toFixed(1)}K`;
    }

    const completed = recentBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'Accepted').length;
    const conversionRate = recentBookings.length > 0 ? Math.round((completed / recentBookings.length) * 100) : 0;

    return {
       upcomingTrips,
       activeClients: clients.size,
       revenue: revenueFormatted,
       conversionRate: `${conversionRate}%`
    };
  };

  const metrics = getMetrics();

  const getLiveCustomersData = () => {
    const customersMap = new Map();
    const customerDetailsMap: Record<string, any> = {};

    recentBookings.forEach((b: any) => {
      const email = b.client?.email && b.client.email !== 'N/A' ? b.client.email : (b.name ? `${b.name.replace(/\s+/g, '').toLowerCase()}@unknown.com` : `unknown_${b.id}@unknown.com`);
      const name = b.client?.name && b.client.name !== 'N/A' ? b.client.name : (b.name || 'Unknown Client');
      const phone = b.client?.phone && b.client.phone !== 'N/A' ? b.client.phone : 'N/A';
      
      const customerId = `C-${email}`;
      
      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
           id: customerId,
           name,
           email: email.includes('@unknown.com') ? 'N/A' : email,
           phone,
           totalBookings: 0,
           status: 'Active'
        });
        customerDetailsMap[customerId] = {
           pastRides: [],
           currentBookings: [],
           payments: []
        };
      }
      
      const customerInfo = customersMap.get(customerId);
      customerInfo.totalBookings += 1;
      
      if (customerInfo.totalBookings > 5) {
         customerInfo.status = 'VIP';
      }

      const rideObj = {
         id: b.id,
         route: b.route || `${b.origin} to ${b.destination}`,
         date: b.date || 'N/A',
         status: b.status || 'Pending',
         price: b.price || '€0'
      };

      if (b.status === 'Completed') {
         customerDetailsMap[customerId].pastRides.push(rideObj);
      } else {
         customerDetailsMap[customerId].currentBookings.push(rideObj);
      }

      customerDetailsMap[customerId].payments.push({
         id: `P-${b.id}`,
         date: b.date || 'N/A',
         amount: b.price || '€0',
         method: b.paymentMethod || 'Credit Card',
         status: b.status === 'Confirmed' || b.status === 'Completed' ? 'Paid' : 'Pending'
      });
    });

    return {
       liveCustomers: Array.from(customersMap.values()),
       liveCustomerDetails: customerDetailsMap
    };
  };

  const { liveCustomers, liveCustomerDetails } = getLiveCustomersData();

  const filteredCustomers = liveCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const selectedCustomer = liveCustomers.find(c => c.id === selectedCustomerId);
  const selectedCustomerData = selectedCustomerId ? liveCustomerDetails[selectedCustomerId] || { pastRides: [], currentBookings: [], payments: [] } : null;

  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedFinancialPartnerId, setSelectedFinancialPartnerId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('Week 24, 2026');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({
    company: '', contact: '', email: '', phone: '', kvk: '', taxNumber: '', bankAccountNumber: '', bicCode: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPartnerPassword, setNewPartnerPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const [mockPartners, setMockPartners] = useState<any[]>([]);

  const [mockPartnerDetails, setMockPartnerDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        let parsed: any[] = [];
        
        // Try getting from Supabase first
        if (supabase) {
          const { data, error } = await supabase.from('partner_registrations').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            parsed = data;
          } else {
            console.error('Supabase partners fetch error:', error);
          }
        }
        
        // If nothing from Supabase, try localStorage
        if (parsed.length === 0) {
          const stored = localStorage.getItem('partner_registrations');
          if (stored) {
            parsed = JSON.parse(stored);
          }
        }

        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const newPartners = parsed.map((p: any) => ({
            id: p.id,
            company: p.company,
            contact: p.contact,
            email: p.email,
            totalRides: p.total_rides || p.totalRides || 0,
            status: p.status
          }));
          
          const newDetails: Record<string, any> = {};
          parsed.forEach((p: any) => {
            newDetails[p.id] = p.details;
          });

          setMockPartners(prev => {
            const combined = [...prev];
            newPartners.forEach((np: any) => {
              if (!combined.find((p: any) => p.id === np.id)) {
                combined.push(np);
              }
            });
            return combined;
          });
          
          setMockPartnerDetails(prev => ({ ...prev, ...newDetails }));
        }
      } catch(err) {
        console.error(err);
      }
    };
    
    fetchPartners();
  }, []);

  const filteredPartners = mockPartners.filter(p => 
    p.company.toLowerCase().includes(partnerSearchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(partnerSearchTerm.toLowerCase())
  );

  const pendingPartners = filteredPartners.filter(p => p.status === 'Pending');
  const activePartners = filteredPartners.filter(p => p.status === 'Active');
  const deactivatedPartners = filteredPartners.filter(p => p.status === 'Inactive');

  const selectedPartner = mockPartners.find(p => p.id === selectedPartnerId);
  const selectedPartnerData = selectedPartnerId ? (mockPartnerDetails[selectedPartnerId] || { documents: [] }) : null;

  const financials = (() => {
    const totalIncome = recentBookings.reduce((sum, booking) => {
      return sum + parseBookingAmount(booking.price);
    }, 0);

    const ourShare = totalIncome * 0.15;

    const completedStatuses = new Set(['Completed', 'Confirmed', 'Accepted']);
    const payoutByPartner = new Map<string, { id: string; company: string; amount: number; ridesCount: number; rides: any[] }>();

    recentBookings
      .filter((booking: any) => completedStatuses.has(booking.status))
      .forEach((booking: any) => {
        const partnerId = String(booking.partnerId || 'UNASSIGNED');
        const company = partnerId === 'UNASSIGNED' ? 'Unassigned / Platform' : `Partner ${partnerId}`;
        const price = parseBookingAmount(booking.price);
        const payout = price * 0.85;

        if (!payoutByPartner.has(partnerId)) {
          payoutByPartner.set(partnerId, { id: partnerId, company, amount: 0, ridesCount: 0, rides: [] });
        }

        const entry = payoutByPartner.get(partnerId)!;
        entry.amount += payout;
        entry.ridesCount += 1;
        entry.rides.push({
          id: booking.id,
          date: booking.date || 'N/A',
          route: booking.route || `${booking.origin || 'N/A'} - ${booking.destination || 'N/A'}`,
          price: price.toFixed(2),
          payout: payout.toFixed(2),
        });
      });

    return {
      totalIncome,
      ourShare,
      toPayWeekly: Array.from(payoutByPartner.values()).sort((a, b) => b.amount - a.amount),
    };
  })();

  const selectedFinancialPartner = selectedFinancialPartnerId ? financials.toPayWeekly.find(p => p.id === selectedFinancialPartnerId) : null;

  const generateFinancialReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(24, 24, 27);
    doc.text("Wait VIP - Admin", 14, 20);

    doc.setFontSize(16);
    doc.text(`Financial Report: ${selectedWeek}`, 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(113, 113, 122);
    doc.text(`Total Platform Revenue: EUR ${financials.totalIncome.toFixed(2)}`, 14, 40);
    doc.text(`Wait VIP Share (15%): EUR ${financials.ourShare.toFixed(2)}`, 14, 46);

    const tableData = financials.toPayWeekly.map((partner) => [
      partner.company,
      partner.ridesCount.toString(),
      `EUR ${partner.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Company', 'Completed Rides', 'Total Payout']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [24, 24, 27] },
    });

    const filename = `financial_report_${selectedWeek.replace(/[\s,]+/g, '_').toLowerCase()}.pdf`;
    doc.save(filename);
  };

  const deletePartner = async (id: string, company: string) => {
    if (window.confirm(`Are you sure you want to delete partner ${company}? This action cannot be undone.`)) {
      setMockPartners(mockPartners.filter(p => p.id !== id));
      setSelectedPartnerId(null);
      if (supabase) {
        try {
          const { error } = await supabase.from('partner_registrations').delete().eq('id', id);
          if (error) console.error("Failed to delete partner from Supabase:", error);
        } catch (err) {
          console.error("Supabase delete error:", err);
        }
      }
    }
  };

  const togglePartnerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    // Optimistic UI update
    setMockPartners(mockPartners.map(p => {
      if (p.id === id) {
        return { ...p, status: newStatus };
      }
      return p;
    }));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('partner_registrations')
          .update({ status: newStatus })
          .eq('id', id);
          
        if (error) {
          console.error("Failed to update status in Supabase:", error);
          // Revert on error
          setMockPartners(mockPartners.map(p => {
            if (p.id === id) {
              return { ...p, status: currentStatus };
            }
            return p;
          }));
        }
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerPassword) return;
    
    // In a real app, this would make an API call to update the password
    setPasswordChangeSuccess(true);
    setNewPartnerPassword('');
    
    setTimeout(() => {
      setPasswordChangeSuccess(false);
      setShowPasswordChange(false);
    }, 3000);
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `P-00${mockPartners.length + 1}`;
    
    setMockPartners([...mockPartners, { 
      id: newId, 
      company: newPartner.company, 
      contact: newPartner.contact, 
      email: newPartner.email, 
      totalRides: 0, 
      status: 'Active' 
    }]);

    setMockPartnerDetails({
      ...mockPartnerDetails,
      [newId]: {
        company: newPartner.company,
        kvk: newPartner.kvk,
        taxNumber: newPartner.taxNumber,
        bankAccountNumber: newPartner.bankAccountNumber,
        bicCode: newPartner.bicCode,
        phone: newPartner.phone,
        documents: []
      }
    });

    setShowAddPartner(false);
    setNewPartner({ company: '', contact: '', email: '', phone: '', kvk: '', taxNumber: '', bankAccountNumber: '', bicCode: '' });
  };

  const updateDocumentStatus = async (partnerId: string, docId: number, status: string) => {
    let updatedDetails: any;
    
    setMockPartnerDetails(prev => {
      const pDetails = prev[partnerId];
      if (!pDetails) return prev;
      const updatedDocs = pDetails.documents.map((d: any) => d.id === docId ? { ...d, status } : d);
      updatedDetails = { ...pDetails, documents: updatedDocs };
      return { ...prev, [partnerId]: updatedDetails };
    });

    if (supabase && updatedDetails) {
      try {
        const { error } = await supabase
          .from('partner_registrations')
          .update({ details: updatedDetails })
          .eq('id', partnerId);
        if (error) console.error("Failed to update document status in Supabase:", error);
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }
  };

  const approveDocument = (partnerId: string, docId: number) => {
    updateDocumentStatus(partnerId, docId, 'Approved');
  };

  const rejectDocument = (partnerId: string, docId: number) => {
    updateDocumentStatus(partnerId, docId, 'Rejected');
  };

  const viewDocument = (doc: any) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else if (doc.fileData) {
      // Legacy support for base64
      try {
        const arr = doc.fileData.split(',');
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: doc.mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (e) {
        console.error("Failed to open document", e);
        alert("Unable to open the document.");
      }
    } else {
      alert(`System message:\nThe PDF/Image file would be shown here from Hostinger for: ${doc.name}\n(No valid upload link found, likely because the Upload API is not configured yet)`);
    }
  };

  return (
    <div className="relative flex min-h-screen pt-20 text-zinc-950 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_45%),radial-gradient(circle_at_top_left,_rgba(24,24,27,0.06),_transparent_35%),#fafafa]">
      <div className="pointer-events-none absolute top-24 -left-20 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-20 left-0 right-0 bg-white border-b border-zinc-200 z-40 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-zinc-900">{activeMenu}</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:text-zinc-900">
          {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-[8.5rem] md:top-20 w-64 h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5rem)] bg-white/95 backdrop-blur border-r border-zinc-200 overflow-y-auto z-30 transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <div key={item.name}>
                <button
                  onClick={() => {
                    setActiveMenu(item.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-zinc-400'}`} />
                    {item.name}
                  </div>
                </button>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full md:ml-64 p-6 lg:p-8 mt-14 md:mt-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {activeMenu === 'Dashboard' && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                  <h1 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Admin Dashboard</h1>
                  <p className="text-zinc-500">Manage your bookings, quotes, and fleet operations.</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                    Export CSV
                  </button>
                  <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors shadow-sm">
                    New Booking
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">Upcoming Trips</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.upcomingTrips}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">Active Clients</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.activeClients}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">Revenue</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.revenue}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.conversionRate}</p>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="border-b border-zinc-200 flex items-center justify-between px-6 py-4">
                  <div className="flex gap-6">
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className={`text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-emerald-500 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Recent Bookings
                    </button>
                    <button 
                      onClick={() => setActiveTab('quotes')}
                      className={`text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors ${activeTab === 'quotes' ? 'border-emerald-500 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Quote Requests
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search bookings..." 
                      className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse cursor-default">
                    <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-sm">
                        <th className="font-medium p-6 font-sans">ID</th>
                        <th className="font-medium p-6 font-sans">Client Name</th>
                        <th className="font-medium p-6 font-sans">Route / Service</th>
                        <th className="font-medium p-6 font-sans">Date</th>
                        <th className="font-medium p-6 font-sans">Status</th>
                        <th className="font-medium p-6 font-sans">Payment</th>
                        <th className="font-medium p-6 font-sans">Total</th>
                        <th className="font-medium p-6 font-sans"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-6 text-sm font-medium text-zinc-900">{booking.id}</td>
                          <td className="p-6 text-sm text-zinc-700">{booking.name}</td>
                          <td className="p-6 text-sm text-zinc-700">{booking.route}</td>
                          <td className="p-6 text-sm text-zinc-500">{new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                          <td className="p-6 text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                              booking.status === 'Pending' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {booking.status === 'Confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                              {booking.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                              {booking.status === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-zinc-700">
                            <div className="flex flex-col gap-1 items-start">
                              {booking.paymentMethod && (
                                <span className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-xs">
                                  {booking.paymentMethod}
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                                {getPaymentStatusLabel(booking.paymentStatus)}
                              </span>
                            </div>
                          </td>
                          <td className="p-6 text-sm font-medium text-zinc-900">{booking.price}</td>
                          <td className="p-6 text-sm text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                 onClick={() => {
                                   setActiveMenu('Bookings');
                                   setSelectedBookingId(booking.id);
                                 }}
                                 className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                              >
                                View
                              </button>
                              <button 
                                 onClick={(e) => handleDeleteBooking(booking.id, e)}
                                 className="text-red-500 font-medium hover:text-red-600 transition-colors p-1"
                                 title="Delete Booking"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {recentBookings.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-zinc-500">No recent activity.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeMenu === 'Bookings' && (
            <div>
              {selectedBooking ? (
                <div className="space-y-6">
                  <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedBookingId(null)} 
                        className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white font-medium hover:bg-zinc-50 transition-colors shadow-sm"
                      >
                        &larr; Back to Bookings
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                          Booking {selectedBooking.id}
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            selectedBooking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                            selectedBooking.status === 'Pending' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {selectedBooking.status}
                          </span>
                        </h2>
                        <p className="text-zinc-500 text-sm">Created on {new Date(selectedBooking.date).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDeleteBooking(selectedBooking.id, e)}
                      className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Booking
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm overflow-hidden">
                         <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                           <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                             <User className="w-4 h-4 text-zinc-500" />
                             Client Details
                           </h3>
                         </div>
                         <div className="p-6 space-y-4">
                           <div>
                             <p className="text-zinc-500 mb-1">Name</p>
                             <p className="font-medium text-zinc-900">{selectedBooking.client.name}</p>
                           </div>
                           <div>
                             <p className="text-zinc-500 mb-1">Email</p>
                             <p className="font-medium text-zinc-900">{selectedBooking.client.email}</p>
                           </div>
                           <div>
                             <p className="text-zinc-500 mb-1">Phone</p>
                             <p className="font-medium text-zinc-900">{selectedBooking.client.phone}</p>
                           </div>
                         </div>
                      </div>

                      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm overflow-hidden">
                         <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                           <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                             <Car className="w-4 h-4 text-zinc-500" />
                             Trip Details
                           </h3>
                         </div>
                         <div className="p-6 space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <p className="text-zinc-500 mb-1">Date</p>
                               <p className="font-medium text-zinc-900">{new Date(selectedBooking.date).toLocaleDateString('en-GB')}</p>
                             </div>
                             <div>
                               <p className="text-zinc-500 mb-1">Time</p>
                               <p className="font-medium text-zinc-900">{selectedBooking.time}</p>
                             </div>
                           </div>
                           <div>
                             <p className="text-zinc-500 mb-1">Vehicle</p>
                             <p className="font-medium text-zinc-900">{selectedBooking.vehicle}</p>
                           </div>
                           {(selectedBooking as any).flightNumber && (
                             <div>
                               <p className="text-zinc-500 mb-1">Flight Number</p>
                               <p className="font-medium text-zinc-900 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md inline-block">{(selectedBooking as any).flightNumber}</p>
                             </div>
                           )}
                           <div>
                             <p className="text-zinc-500 mb-1">Passengers</p>
                             <p className="font-medium text-zinc-900">{selectedBooking.passengers} Persons</p>
                           </div>
                           <div>
                             <p className="text-zinc-500 mb-1">Total Price</p>
                             <div className="flex items-center gap-3">
                               <p className="font-medium text-zinc-900 text-lg">{selectedBooking.price}</p>
                               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getPaymentStatusBadgeClass(selectedBooking.paymentStatus)}`}>
                                 {getPaymentStatusLabel(selectedBooking.paymentStatus)}
                               </span>
                             </div>
                           </div>
                           {(selectedBooking as any).paymentMethod && (
                             <div>
                               <p className="text-zinc-500 mb-1">Payment Method</p>
                               <p className="font-medium text-zinc-900">{(selectedBooking as any).paymentMethod}</p>
                             </div>
                           )}
                         </div>
                      </div>
                      
                      {selectedBooking.notes && (
                        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm overflow-hidden">
                          <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-zinc-500" />
                              Client Notes
                            </h3>
                          </div>
                          <div className="p-6">
                            <p className="text-zinc-700 italic">"{selectedBooking.notes}"</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Map & Route */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                         <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                           <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-zinc-500" />
                             Route Map
                           </h3>
                         </div>
                         <div className="p-6 border-b border-zinc-200">
                           <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-zinc-200">
                              <div className="relative">
                                <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm" />
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Pickup</p>
                                <p className="font-medium text-zinc-900">{selectedBooking.origin}</p>
                              </div>
                              
                              {selectedBooking.waypoints && selectedBooking.waypoints.length > 0 && selectedBooking.waypoints.map((wp: any, idx: number) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-white border-[3px] border-zinc-400 shadow-sm" />
                                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Stopover</p>
                                  <p className="font-medium text-zinc-900">{typeof wp === 'string' ? wp : wp.location}</p>
                                  {typeof wp === 'object' && wp.waitTime > 0 && <p className="text-xs text-zinc-500 font-medium">Wait Time: {wp.waitTime} hour(s)</p>}
                                </div>
                              ))}

                              {selectedBooking.destination !== 'N/A' && (
                                <div className="relative">
                                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-white border-4 border-black shadow-sm" />
                                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Drop-off</p>
                                  <p className="font-medium text-zinc-900">{selectedBooking.destination}</p>
                                </div>
                              )}
                           </div>
                         </div>
                         <div className="flex-1 p-2 bg-zinc-50">
                            <BookingMap 
                              origin={selectedBooking.origin} 
                              destination={selectedBooking.destination === 'N/A' || !selectedBooking.destination ? selectedBooking.origin : selectedBooking.destination} 
                              waypoints={selectedBooking.waypoints?.map((wp: any) => typeof wp === 'string' ? wp : (wp.location || wp))}
                            />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                    <div>
                      <h1 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Bookings</h1>
                      <p className="text-zinc-500">View and manage all incoming reservations.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="border-b border-zinc-200 flex items-center justify-between px-6 py-4">
                      <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="Search bookings..." 
                          className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse cursor-default">
                        <thead>
                          <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 text-sm">
                            <th className="font-medium p-6 font-sans">ID</th>
                            <th className="font-medium p-6 font-sans">Client Name</th>
                            <th className="font-medium p-6 font-sans">Route / Service</th>
                            <th className="font-medium p-6 font-sans">Date</th>
                            <th className="font-medium p-6 font-sans">Status</th>
                            <th className="font-medium p-6 font-sans">Payment</th>
                            <th className="font-medium p-6 font-sans">Total</th>
                            <th className="font-medium p-6 font-sans"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {recentBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="p-6 text-sm font-medium text-zinc-900">{booking.id}</td>
                              <td className="p-6 text-sm text-zinc-700">{booking.name}</td>
                              <td className="p-6 text-sm text-zinc-700">
                                {booking.route.includes('hours') ? (
                                  <>{booking.route}</>
                                ) : (
                                  <>
                                    {booking.route.split(' to ')[0]}
                                    {booking.waypoints && booking.waypoints.length > 0 && <span className="text-zinc-500 text-xs"> &rarr; {booking.waypoints.length} stop(s) </span>}
                                    &rarr; {booking.route.split(' to ')[1] || booking.route}
                                  </>
                                )}
                              </td>
                              <td className="p-6 text-sm text-zinc-500">{new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                              <td className="p-6 text-sm">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                  booking.status === 'Pending' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {booking.status === 'Confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                                  {booking.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                                  {booking.status === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                                  {booking.status}
                                </span>
                              </td>
                              <td className="p-6 text-sm text-zinc-700">
                                <div className="flex flex-col gap-1 items-start">
                                  {booking.paymentMethod && (
                                    <span className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-xs">
                                      {booking.paymentMethod}
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                                    {getPaymentStatusLabel(booking.paymentStatus)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-6 text-sm font-medium text-zinc-900">{booking.price}</td>
                              <td className="p-6 text-sm text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button 
                                     onClick={() => setSelectedBookingId(booking.id)}
                                     className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                                  >
                                    View
                                  </button>
                                  <button 
                                     onClick={(e) => handleDeleteBooking(booking.id, e)}
                                     className="text-red-500 font-medium hover:text-red-600 transition-colors p-1"
                                     title="Delete Booking"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {false && (
            <div>
              {selectedPartner ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <button 
                      onClick={() => {
                        setSelectedPartnerId(null);
                        setShowPasswordChange(false);
                      }} 
                      className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white font-medium hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                      &larr; Back to Partners
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        {selectedPartner.company}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          selectedPartner.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedPartner.status === 'Pending' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {selectedPartner.status}
                        </span>
                      </h2>
                      <p className="text-zinc-500 text-sm mt-1">{selectedPartner.email} &bull; {selectedPartner.contact}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">Partner Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Company</p>
                        <p className="font-semibold">{selectedPartnerData.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">KVK Number</p>
                        <p className="font-semibold">{selectedPartnerData.kvk}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Tax Number</p>
                        <p className="font-semibold">{selectedPartnerData.taxNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Bank Account Number (IBAN)</p>
                        <p className="font-semibold">{selectedPartnerData.bankAccountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">BIC Code</p>
                        <p className="font-semibold">{selectedPartnerData.bicCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Phone</p>
                        <p className="font-semibold">{selectedPartnerData.phone}</p>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-wrap gap-4 items-start">
                      <button 
                        onClick={() => togglePartnerStatus(selectedPartner.id, selectedPartner.status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedPartner.status === 'Active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {selectedPartner.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                      </button>

                      <button
                        onClick={() => deletePartner(selectedPartner.id, selectedPartner.company)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Partner
                      </button>
                      
                      <div className="flex-1">
                        {!showPasswordChange ? (
                          <button 
                            onClick={() => setShowPasswordChange(true)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                          >
                            Change Password
                          </button>
                        ) : (
                          <form onSubmit={handlePasswordChange} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 max-w-md">
                            <h4 className="text-sm font-bold text-zinc-900 mb-3">Change Password for {selectedPartner.company}</h4>
                            <div className="space-y-3">
                              <input 
                                type="password" 
                                required
                                value={newPartnerPassword}
                                onChange={(e) => setNewPartnerPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                              <div className="flex gap-2">
                                <button 
                                  type="submit"
                                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-colors"
                                >
                                  Save Password
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setShowPasswordChange(false);
                                    setNewPartnerPassword('');
                                    setPasswordChangeSuccess(false);
                                  }}
                                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                            {passwordChangeSuccess && (
                              <p className="text-xs font-medium text-green-600 mt-3 pt-3 border-t border-zinc-200">
                                Password successfully updated!
                              </p>
                            )}
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-100">
                      <h3 className="text-lg font-bold text-zinc-900">Uploaded Documents</h3>
                    </div>
                    {selectedPartnerData.documents && selectedPartnerData.documents.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                            <th className="p-4 font-medium">Document Name</th>
                            <th className="p-4 font-medium">Upload Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPartnerData.documents.map((doc: any, i: number) => (
                            <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                              <td className="p-4 text-sm font-medium text-zinc-900 flex items-center gap-2">
                                <Car className="w-4 h-4 text-zinc-400" /> {doc.name}
                              </td>
                              <td className="p-4 text-sm text-zinc-500">{doc.date}</td>
                              <td className="p-4 text-sm">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                                  doc.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                  doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {doc.status}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-right">
                                <div className="flex justify-end gap-2">
                                  {doc.status !== 'Missing' && (
                                    <button 
                                      onClick={() => viewDocument(doc)}
                                      className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1 rounded text-xs font-medium hover:bg-zinc-50"
                                    >
                                      View
                                    </button>
                                  )}
                                  {doc.status === 'Pending' && (
                                    <>
                                      <button onClick={() => approveDocument(selectedPartner.id, doc.id)} className="bg-green-50 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-100">Approve</button>
                                      <button onClick={() => rejectDocument(selectedPartner.id, doc.id)} className="bg-red-50 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-100">Reject</button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-zinc-500 text-sm">No documents uploaded yet.</div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900">Partners (Taxi Companies)</h2>
                      <p className="text-zinc-500 mt-1">Manage partner registrations, documents, and account status.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="Search partners..." 
                          value={partnerSearchTerm}
                          onChange={(e) => setPartnerSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                        />
                      </div>
                      {!showAddPartner && (
                        <button 
                          onClick={() => setShowAddPartner(true)}
                          className="bg-emerald-500 text-zinc-950 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" /> Add Partner
                        </button>
                      )}
                    </div>
                  </div>

                  {showAddPartner && (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 mb-8 mt-4">
                      <h3 className="text-lg font-bold text-zinc-900 mb-6">Add New Partner</h3>
                      <form onSubmit={handleAddPartner} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Company Name *</label>
                            <input 
                              type="text" required 
                              value={newPartner.company} onChange={e => setNewPartner({...newPartner, company: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">KVK Number *</label>
                            <input 
                              type="text" required 
                              value={newPartner.kvk} onChange={e => setNewPartner({...newPartner, kvk: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Contact Person *</label>
                            <input 
                              type="text" required 
                              value={newPartner.contact} onChange={e => setNewPartner({...newPartner, contact: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Phone Number *</label>
                            <input 
                              type="tel" required 
                              value={newPartner.phone} onChange={e => setNewPartner({...newPartner, phone: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Email Address *</label>
                            <input 
                              type="email" required 
                              value={newPartner.email} onChange={e => setNewPartner({...newPartner, email: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Tax Number *</label>
                            <input 
                              type="text" required 
                              value={newPartner.taxNumber} onChange={e => setNewPartner({...newPartner, taxNumber: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Bank Account Number (IBAN) *</label>
                            <input 
                              type="text" required 
                              value={newPartner.bankAccountNumber} onChange={e => setNewPartner({...newPartner, bankAccountNumber: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">BIC Code *</label>
                            <input 
                              type="text" required 
                              value={newPartner.bicCode} onChange={e => setNewPartner({...newPartner, bicCode: e.target.value})}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                          <button 
                            type="button" 
                            onClick={() => setShowAddPartner(false)} 
                            className="px-6 py-2.5 rounded-xl font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-6 py-2.5 rounded-xl font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-sm"
                          >
                            Create Partner
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-8">
                    {/* Pending Partners */}
                    {false && (
                      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                          <h3 className="text-lg font-bold text-zinc-900">Pending Approval</h3>
                          <p className="text-sm text-zinc-500 mt-1">Partners waiting for account activation.</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                              <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                                <th className="p-6 font-medium">Company Name</th>
                                <th className="p-6 font-medium">Contact Person</th>
                                <th className="p-6 font-medium">Total Rides</th>
                                <th className="p-6 font-medium">Status</th>
                                <th className="p-6 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingPartners.length > 0 ? pendingPartners.map((partner) => (
                                <tr key={partner.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                                  <td className="p-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                        <Building2 className="w-5 h-5 text-zinc-500" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-zinc-900">{partner.company}</p>
                                        <p className="text-sm text-zinc-500">{partner.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-6 text-sm text-zinc-700">{partner.contact}</td>
                                  <td className="p-6 text-sm font-medium text-zinc-900">{partner.totalRides}</td>
                                  <td className="p-6">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200`}>
                                      {partner.status}
                                    </span>
                                  </td>
                                  <td className="p-6 text-sm text-right">
                                    <button 
                                      onClick={() => setSelectedPartnerId(partner.id)}
                                      className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs"
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">
                                    No pending partners found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Active Partners */}
                    {false && (
                      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                          <h3 className="text-lg font-bold text-zinc-900">Approved Partners</h3>
                          <p className="text-sm text-zinc-500 mt-1">Active partner accounts.</p>
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                              <th className="p-6 font-medium">Company Name</th>
                              <th className="p-6 font-medium">Contact Person</th>
                              <th className="p-6 font-medium">Total Rides</th>
                              <th className="p-6 font-medium">Avg. Rating</th>
                              <th className="p-6 font-medium">Status</th>
                              <th className="p-6 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activePartners.length > 0 ? activePartners.map((partner) => {
                              const ratings = JSON.parse(localStorage.getItem('customerRatings') || '[]').filter((r: any) => r.partnerId === partner.id);
                              const avg = ratings.length > 0 ? (ratings.reduce((acc: number, cur: any) => acc + cur.score, 0) / ratings.length) : 5.0;
                              const isBlocked = avg < 4.5;
                              
                              return (
                              <tr key={partner.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                                <td className="p-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                      <Building2 className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-zinc-900">{partner.company}</p>
                                      <p className="text-sm text-zinc-500">{partner.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-6 text-sm text-zinc-700">{partner.contact}</td>
                                <td className="p-6 text-sm font-medium text-zinc-900">{partner.totalRides}</td>
                                <td className="p-6 text-sm font-medium text-zinc-900">
                                  <div className="flex items-center gap-1">
                                    <Star className={`w-4 h-4 ${isBlocked ? 'fill-red-500 text-red-500' : 'fill-emerald-500 text-emerald-500'}`} />
                                    <span className={isBlocked ? "text-red-600" : ""}>{avg.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="p-6">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    isBlocked ? 'bg-red-50 text-red-700 border-red-200' :
                                    partner.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-zinc-100 text-zinc-700 border-zinc-200'
                                  }`}>
                                    {isBlocked ? 'Blocked' : partner.status}
                                  </span>
                                </td>
                                <td className="p-6 text-sm text-right">
                                  <button 
                                    onClick={() => setSelectedPartnerId(partner.id)}
                                    className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            )}) : (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">
                                  No approved partners found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    )}

                    {/* Deactivated Partners */}
                    {false && (
                      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                          <h3 className="text-lg font-bold text-zinc-900">Deactivated Partners</h3>
                          <p className="text-sm text-zinc-500 mt-1">Partner accounts that have been deactivated or blocked.</p>
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                              <th className="p-6 font-medium">Company Name</th>
                              <th className="p-6 font-medium">Contact Person</th>
                              <th className="p-6 font-medium">Total Rides</th>
                              <th className="p-6 font-medium">Avg. Rating</th>
                              <th className="p-6 font-medium">Status</th>
                              <th className="p-6 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deactivatedPartners.length > 0 ? deactivatedPartners.map((partner) => {
                              const ratings = JSON.parse(localStorage.getItem('customerRatings') || '[]').filter((r: any) => r.partnerId === partner.id);
                              const avg = ratings.length > 0 ? (ratings.reduce((acc: number, cur: any) => acc + cur.score, 0) / ratings.length) : 5.0;
                              const isBlocked = avg < 4.5;
                              
                              return (
                              <tr key={partner.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors">
                                <td className="p-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                      <Building2 className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-zinc-900">{partner.company}</p>
                                      <p className="text-sm text-zinc-500">{partner.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-6 text-sm text-zinc-700">{partner.contact}</td>
                                <td className="p-6 text-sm font-medium text-zinc-900">{partner.totalRides}</td>
                                <td className="p-6 text-sm font-medium text-zinc-900">
                                  <div className="flex items-center gap-1">
                                    <Star className={`w-4 h-4 ${isBlocked ? 'fill-red-500 text-red-500' : 'fill-emerald-500 text-emerald-500'}`} />
                                    <span className={isBlocked ? "text-red-600" : ""}>{avg.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="p-6">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    isBlocked ? 'bg-red-50 text-red-700 border-red-200' :
                                    partner.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-zinc-100 text-zinc-700 border-zinc-200'
                                  }`}>
                                    {isBlocked ? 'Blocked' : partner.status}
                                  </span>
                                </td>
                                <td className="p-6 text-sm text-right">
                                  <button 
                                    onClick={() => setSelectedPartnerId(partner.id)}
                                    className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            )}) : (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-zinc-500 text-sm">
                                  No deactivated partners found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeMenu === 'Customers' && (
            <div>
              {selectedCustomer ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <button 
                      onClick={() => setSelectedCustomerId(null)} 
                      className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white font-medium hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                      &larr; Back to Customers
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        {selectedCustomer.name}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          selectedCustomer.status === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          selectedCustomer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {selectedCustomer.status}
                        </span>
                      </h2>
                      <p className="text-zinc-500 text-sm">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Bookings */}
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          Current Bookings
                        </h3>
                      </div>
                      <div className="divide-y divide-zinc-100 flex-1">
                        {selectedCustomerData?.currentBookings.length > 0 ? (
                          selectedCustomerData.currentBookings.map((booking: any) => (
                            <div key={booking.id} className="p-4 sm:p-6 hover:bg-zinc-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-zinc-900">{booking.route}</span>
                                <span className="font-medium text-zinc-900">{booking.price}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-500">{new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  {booking.paymentMethod && (
                                    <span className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-xs ml-3 text-zinc-600">
                                      {booking.paymentMethod}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {booking.status}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      setActiveMenu('Bookings');
                                      setSelectedBookingId(booking.id);
                                    }}
                                    className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors ml-2"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-zinc-500 text-sm">No current bookings.</div>
                        )}
                      </div>
                    </div>

                    {/* Past Rides */}
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-zinc-500" />
                          Past Rides
                        </h3>
                      </div>
                      <div className="divide-y divide-zinc-100 flex-1">
                        {selectedCustomerData?.pastRides.length > 0 ? (
                          selectedCustomerData.pastRides.map((ride: any) => (
                            <div key={ride.id} className="p-4 sm:p-6 hover:bg-zinc-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-zinc-900">{ride.route}</span>
                                <span className="font-medium text-zinc-900">{ride.price}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-500">{new Date(ride.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  {ride.paymentMethod && (
                                    <span className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-xs ml-3 text-zinc-600">
                                      {ride.paymentMethod}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-500">ID: {ride.id}</span>
                                  <a href={`/rate/${ride.id}`} target="_blank" className="text-zinc-600 hover:text-zinc-900 font-medium ml-2">
                                    <Star className="w-4 h-4 inline mr-1" />
                                    Rate Driver
                                  </a>
                                  <button 
                                    onClick={() => {
                                      setActiveMenu('Bookings');
                                      setSelectedBookingId(ride.id);
                                    }}
                                    className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors ml-2"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-zinc-500 text-sm">No past rides.</div>
                        )}
                      </div>
                    </div>

                    {/* Payments */}
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden col-span-1 lg:col-span-2">
                      <div className="border-b border-zinc-200 px-6 py-4 bg-zinc-50">
                        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-zinc-500" />
                          Payment History
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse cursor-default text-sm">
                          <thead>
                            <tr className="bg-white border-b border-zinc-200 text-zinc-500">
                              <th className="font-medium p-4 lg:p-6">Transaction ID</th>
                              <th className="font-medium p-4 lg:p-6">Date</th>
                              <th className="font-medium p-4 lg:p-6">Method</th>
                              <th className="font-medium p-4 lg:p-6">Status</th>
                              <th className="font-medium p-4 lg:p-6 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedCustomerData?.payments.length > 0 ? (
                              selectedCustomerData.payments.map((payment: any) => (
                                <tr key={payment.id} className="hover:bg-zinc-50 transition-colors">
                                  <td className="p-4 lg:p-6 font-medium text-zinc-900">{payment.id}</td>
                                  <td className="p-4 lg:p-6 text-zinc-500">{new Date(payment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td className="p-4 lg:p-6 text-zinc-700">{payment.method}</td>
                                  <td className="p-4 lg:p-6">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                      payment.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                      'bg-zinc-100 text-zinc-700 border-zinc-200'
                                    }`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                  <td className="p-4 lg:p-6 font-medium text-zinc-900 text-right">{payment.amount}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500">
                                  No payment history found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Customers</h2>
                      <p className="text-zinc-500 text-sm">Manage your client list and details.</p>
                    </div>
                    <div className="mt-4 md:mt-0 relative w-full md:w-64">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search name or email..." 
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500">
                            <th className="font-medium p-4 lg:p-6 font-sans">ID</th>
                            <th className="font-medium p-4 lg:p-6 font-sans">Name</th>
                            <th className="font-medium p-4 lg:p-6 font-sans">Email</th>
                            <th className="font-medium p-4 lg:p-6 font-sans">Phone</th>
                            <th className="font-medium p-4 lg:p-6 font-sans">Bookings</th>
                            <th className="font-medium p-4 lg:p-6 font-sans">Status</th>
                            <th className="font-medium p-4 lg:p-6 font-sans"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {filteredCustomers.map((customer) => (
                            <tr 
                              key={customer.id} 
                              onClick={() => setSelectedCustomerId(customer.id)}
                              className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="p-4 lg:p-6 font-medium text-zinc-900">{customer.id}</td>
                              <td className="p-4 lg:p-6 font-medium text-zinc-900">{customer.name}</td>
                              <td className="p-4 lg:p-6 text-zinc-500">{customer.email}</td>
                              <td className="p-4 lg:p-6 text-zinc-500">{customer.phone}</td>
                              <td className="p-4 lg:p-6 text-zinc-700">{customer.totalBookings}</td>
                              <td className="p-4 lg:p-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  customer.status === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  customer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-zinc-100 text-zinc-700 border-zinc-200'
                                }`}>
                                  {customer.status}
                                </span>
                              </td>
                              <td className="p-4 lg:p-6 text-right">
                                <button 
                                  className="text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg border border-transparent group-hover:bg-emerald-50 group-hover:border-emerald-200"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredCustomers.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-zinc-500">
                                No customers found matching "{customerSearchTerm}".
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeMenu === 'Financial' && (
            <div>
              {selectedFinancialPartner ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button 
                      onClick={() => setSelectedFinancialPartnerId(null)}
                      className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm"
                      title="Back to Financial Overview"
                    >
                      <ArrowLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold font-sans tracking-tight text-zinc-900">{selectedFinancialPartner.company} Details</h2>
                      <p className="text-zinc-500 text-sm">Review weekly payout and rides.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Wallet className="w-5 h-5 text-zinc-600" />
                        <h3 className="font-semibold text-zinc-900">Total Payout</h3>
                      </div>
                      <p className="text-3xl font-bold text-zinc-900">€ {selectedFinancialPartner.amount.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-5 h-5 text-zinc-600" />
                        <h3 className="font-semibold text-zinc-900">Total Rides</h3>
                      </div>
                      <p className="text-3xl font-bold text-zinc-900">{selectedFinancialPartner.ridesCount}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
                      <h3 className="font-semibold text-zinc-900">Rides for this period</h3>
                      <button className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
                        Mark as Paid
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="p-4 font-semibold text-sm text-zinc-600">ID</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Date</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Route</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Price Paid by Customer</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Payout (85%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFinancialPartner.rides.map((ride: any) => (
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
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Financial Overview</h2>
                      <p className="text-zinc-500 text-sm">Monitor revenue, platform earnings, and partner payouts.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
                       <select 
                         value={selectedWeek}
                         onChange={(e) => setSelectedWeek(e.target.value)}
                         className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 outline-none hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
                       >
                         <option value="Week 24, 2026">Week 24 (Jun 8 - Jun 14)</option>
                         <option value="Week 23, 2026">Week 23 (Jun 1 - Jun 7)</option>
                         <option value="Week 22, 2026">Week 22 (May 25 - May 31)</option>
                         <option value="Week 21, 2026">Week 21 (May 18 - May 24)</option>
                       </select>
                       <button onClick={generateFinancialReport} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                         <Download className="w-4 h-4" /> Download Report
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-zinc-950 to-zinc-800 text-white p-6 border border-zinc-700 shadow-sm rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-emerald-300" />
                        <h3 className="font-semibold text-zinc-100">Total Platform Revenue</h3>
                      </div>
                      <p className="text-4xl font-bold mt-2">€ {financials.totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Wallet className="w-5 h-5 text-zinc-500" />
                            <h3 className="font-semibold text-zinc-700">Wait VIP Share (15%)</h3>
                          </div>
                          <p className="text-4xl font-bold text-green-600 mt-2">€ {financials.ourShare.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-200">
                      <h3 className="text-lg font-bold text-zinc-900">Weekly Fleet Payout Overview</h3>
                      <p className="text-sm text-zinc-500">Amounts scheduled for completed rides in {selectedWeek}.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="p-4 font-semibold text-sm text-zinc-600">Company</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Completed Rides</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Total Payout</th>
                            <th className="p-4 font-semibold text-sm text-zinc-600">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financials.toPayWeekly.map((partner) => (
                            <tr key={partner.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                              <td className="p-4 text-sm font-medium text-zinc-900">{partner.company}</td>
                              <td className="p-4 text-sm text-zinc-600">{partner.ridesCount}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900">€ {partner.amount.toFixed(2)}</td>
                              <td className="p-4 text-sm">
                                <button 
                                  onClick={() => setSelectedFinancialPartnerId(partner.id)}
                                  className="text-blue-600 font-medium hover:underline text-sm"
                                >
                                  View Rides
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeMenu === 'Coupons' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Coupons</h2>
                  <p className="text-zinc-500 text-sm">Create and manage discount codes for customers.</p>
                </div>
                <button 
                  onClick={() => setShowAddCoupon(true)}
                  className="mt-4 md:mt-0 bg-emerald-500 text-zinc-950 px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Coupon
                </button>
              </div>

              {showAddCoupon && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-8 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">{newCoupon.code ? 'Edit Coupon' : 'New Coupon'}</h3>
                  <form onSubmit={handleAddCoupon} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Coupon Code</label>
                        <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase" placeholder="SUMMER2026" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Discount Amount</label>
                        <div className="flex">
                           <input required type="number" step="0.01" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="10" />
                           <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value as 'percent' | 'fixed'})} className="bg-zinc-100 border border-zinc-200 border-l-0 rounded-r-xl px-4 py-3 focus:outline-none">
                             <option value="percent">%</option>
                             <option value="fixed">EUR</option>
                           </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setShowAddCoupon(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100">Cancel</button>
                      <button type="submit" className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800">Save Coupon</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                {coupons.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    <Ticket className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                    <p>No coupons have been created yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500">
                        <th className="p-4 font-medium">Code</th>
                        <th className="p-4 font-medium">Discount</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon, i) => (
                        <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                          <td className="p-4 font-bold text-zinc-900">{coupon.code}</td>
                          <td className="p-4 text-sm font-medium text-zinc-700">
                            {coupon.type === 'percent' ? `${coupon.discount}% Off` : `€${coupon.discount} Off`}
                          </td>
                          <td className="p-4 text-sm">
                            <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-600 hover:underline font-medium">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'Tracking' && (
            <div>
              {selectedTrackingIp ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button 
                      onClick={() => setSelectedTrackingIp(null)}
                      className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <div>
                      <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Tracking Details: {selectedTrackingIp}</h2>
                      <p className="text-zinc-500 text-sm">Action history for this IP address.</p>
                    </div>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/80 border-b border-zinc-200">
                            <th className="font-medium p-6 text-sm text-zinc-900">Time</th>
                            <th className="font-medium p-6 text-sm text-zinc-900">Action</th>
                            <th className="font-medium p-6 text-sm text-zinc-900">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {trackingEvents.filter(e => e.ipAddress === selectedTrackingIp).map((evt) => (
                            <tr key={evt.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="p-6 text-sm text-zinc-500 w-32 whitespace-nowrap">
                                {new Date(evt.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </td>
                              <td className="p-6">
                                <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
                                  {evt.action}
                                </span>
                              </td>
                              <td className="p-6 text-sm text-zinc-600 max-w-xl break-words">
                                {evt.details}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Live Visitor Tracking</h2>
                      <p className="text-zinc-500 text-sm">Monitor visitors based on IP address and view their interactions.</p>
                    </div>
                    <button
                      onClick={async () => {
                        await clearTrackingEvents();
                        setTrackingEvents([]);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Logs
                    </button>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/80 border-b border-zinc-200">
                            <th className="font-medium p-6 text-sm text-zinc-900">Last Active</th>
                            <th className="font-medium p-6 text-sm text-zinc-900">IP Address</th>
                            <th className="font-medium p-6 text-sm text-zinc-900">Events Recorded</th>
                            <th className="font-medium p-6 text-sm text-zinc-900"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {(() => {
                            const groupedVisitors = Array.from(trackingEvents.reduce((map, evt) => {
                              if (!map.has(evt.ipAddress)) {
                                map.set(evt.ipAddress, { ipAddress: evt.ipAddress, lastSeen: evt.timestamp, eventCount: 0 });
                              }
                              map.get(evt.ipAddress)!.eventCount++;
                              return map;
                            }, new Map<string, {ipAddress: string, lastSeen: string, eventCount: number}>()).values());

                            return groupedVisitors.length > 0 ? groupedVisitors.map((visitor: {ipAddress: string, lastSeen: string, eventCount: number}) => (
                              <tr key={visitor.ipAddress} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-6 text-sm text-zinc-500 w-32 whitespace-nowrap">
                                  {new Date(visitor.lastSeen).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                                <td className="p-6 text-sm font-medium text-zinc-900">
                                  {visitor.ipAddress}
                                </td>
                                <td className="p-6">
                                  <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
                                    {visitor.eventCount} actions
                                  </span>
                                </td>
                                <td className="p-6 text-right">
                                  <button
                                    onClick={() => setSelectedTrackingIp(visitor.ipAddress)}
                                    className="text-blue-600 font-medium hover:text-blue-700 text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                  >
                                    View Activity
                                  </button>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="p-12 text-center text-zinc-500">
                                  No tracking data available yet.
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Settings' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 mb-2">Settings</h2>
                  <p className="text-zinc-500 text-sm">Manage system configurations and integrations.</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="space-y-6 max-w-2xl">
                    <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shadow-sm">
                           <Car className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-900">Vehicle categories</h4>
                          <p className="text-sm text-zinc-500">Set the price per kilometer for each category.</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <label htmlFor="sedanPrice" className="text-sm font-medium text-zinc-700">Sedan</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="0.01"
                              id="sedanPrice"
                              value={sedanPrice}
                              onChange={(e) => setSedanPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <label htmlFor="vanPrice" className="text-sm font-medium text-zinc-700">Van</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="0.01"
                              id="vanPrice"
                              value={vanPrice}
                              onChange={(e) => setVanPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <label htmlFor="luxurySedanPrice" className="text-sm font-medium text-zinc-700">Luxury Sedan</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="0.01"
                              id="luxurySedanPrice"
                              value={luxurySedanPrice}
                              onChange={(e) => setLuxurySedanPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-zinc-200 mt-2">
                          <div>
                            <label htmlFor="minimumDistance" className="text-sm font-medium text-zinc-700 block">Minimum distance (km)</label>
                            <span className="text-xs text-zinc-500">Number of km covered by the minimum fare</span>
                          </div>
                          <div className="relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">km</span>
                            <input 
                              type="number" 
                              step="1"
                              id="minimumDistance"
                              value={minimumDistance}
                              onChange={(e) => setMinimumDistance(e.target.value)}
                              className="w-full pl-4 pr-10 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-zinc-200 mt-2">
                          <div>
                            <label htmlFor="minimumPrice" className="text-sm font-medium text-zinc-700 block">Minimum fare</label>
                            <span className="text-xs text-zinc-500">Applies to transfer rides up to {minimumDistance} km</span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="0.01"
                              id="minimumPrice"
                              value={minimumPrice}
                              onChange={(e) => setMinimumPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-200">
                          <button onClick={handleSavePrices} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors shadow-sm">
                            Save fares
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shadow-sm">
                           <Clock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-900">Hourly rates (Hourly Driver)</h4>
                          <p className="text-sm text-zinc-500">Set the hourly rate for each category.</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <label htmlFor="hourlySedanPrice" className="text-sm font-medium text-zinc-700">Sedan (per hour)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="1"
                              id="hourlySedanPrice"
                              value={hourlySedanPrice}
                              onChange={(e) => setHourlySedanPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <label htmlFor="hourlyVanPrice" className="text-sm font-medium text-zinc-700">Van (per hour)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="1"
                              id="hourlyVanPrice"
                              value={hourlyVanPrice}
                              onChange={(e) => setHourlyVanPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <label htmlFor="hourlyLuxuryPrice" className="text-sm font-medium text-zinc-700">Luxury Sedan (per hour)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">€</span>
                            <input 
                              type="number" 
                              step="1"
                              id="hourlyLuxuryPrice"
                              value={hourlyLuxuryPrice}
                              onChange={(e) => setHourlyLuxuryPrice(e.target.value)}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-200">
                          <button onClick={handleSavePrices} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors shadow-sm">
                            Save fares
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-sans tracking-tight text-zinc-900 mb-6 mt-12">Integrations</h3>
                  
                  <div className="space-y-6 max-w-2xl">
                    <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shadow-sm">
                           <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-900">Google Maps Integration</h4>
                          <p className="text-sm text-zinc-500">Enable autocomplete and route tracking by adding your Maps API key.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="googleMapsApi" className="block text-sm font-medium text-zinc-700 mb-1">Google Maps Platform Key</label>
                          <input 
                            type="password" 
                            id="googleMapsApi"
                            value={googleMapsApiKey}
                            onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                            placeholder="AIzaSy..." 
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow shadow-sm"
                          />
                          <p className="mt-1.5 text-xs text-zinc-500">Your API key is stored locally to avoid exposing it.</p>
                        </div>

                        <div className="pt-2">
                          <button onClick={handleSaveMapApiKey} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors shadow-sm">
                            Save API Key
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shadow-sm">
                           <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-900">Mollie Integration</h4>
                          <p className="text-sm text-zinc-500">Configure your Mollie account for processing payments.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="mollieApiKey" className="block text-sm font-medium text-zinc-700 mb-1">Mollie API Key (Test of Live)</label>
                          <input 
                            type="password" 
                            id="mollieApiKey"
                            placeholder="live_... of test_..." 
                            value={mollieApiKey}
                            onChange={(e) => setMollieApiKey(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow shadow-sm"
                          />
                          <p className="mt-1.5 text-xs text-zinc-500">Je kunt hier zowel een live key ("live_...") als een test key ("test_...") invullen.</p>
                        </div>

                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={handleSaveMollieKey}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors shadow-sm">
                            Save Configuration
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-sans tracking-tight text-zinc-900 mb-6 mt-12">Marketing & Conversion</h3>
                  
                  <div className="space-y-6 max-w-2xl">
                    <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shadow-sm">
                           <Ticket className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-zinc-900">Exit Intent Popup</h4>
                          <p className="text-sm text-zinc-500">Show a popup with a discount code when users try to leave the website.</p>
                        </div>
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={exitPopupEnabled}
                              onChange={(e) => setExitPopupEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Popup Title</label>
                          <input 
                            type="text" 
                            value={exitPopupTitle}
                            onChange={(e) => setExitPopupTitle(e.target.value)}
                            disabled={!exitPopupEnabled}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Popup Message</label>
                          <textarea 
                            value={exitPopupMessage}
                            onChange={(e) => setExitPopupMessage(e.target.value)}
                            disabled={!exitPopupEnabled}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Discount Code</label>
                          <input 
                            type="text" 
                            value={exitPopupCode}
                            onChange={(e) => setExitPopupCode(e.target.value)}
                            disabled={!exitPopupEnabled}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-mono"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Button Text</label>
                          <input 
                            type="text" 
                            value={exitPopupButton}
                            onChange={(e) => setExitPopupButton(e.target.value)}
                            disabled={!exitPopupEnabled}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          />
                        </div>

                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={handleSaveExitPopupSettings}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors shadow-sm">
                            Save Popup Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


