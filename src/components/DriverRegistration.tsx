import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, User, Car, Check, ShieldCheck, Banknote, MapPin, Clock, Upload, File as FileIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { navigateTo } from '../lib/navigation';

export default function DriverRegistration() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    kvkNumber: '',
    taxNumber: '',
    bankAccountNumber: '',
    bicCode: '',
  });
  const [documents, setDocuments] = useState<Record<string, File | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const documentFields = [
    { key: 'idPassport', label: 'ID/Passport', required: true },
    { key: 'driversLicenseFront', label: "Driver's License Front", required: true },
    { key: 'driversLicenseBack', label: "Driver's License Back", required: true },
    { key: 'transportationLicense', label: 'Transportation License', required: true },
    { key: 'vehicleRegistrationFront', label: 'Vehicle Registration Front', required: true },
    { key: 'vehicleRegistrationBack', label: 'Vehicle Registration Back', required: true },
    { key: 'vehicleInspectionCertificate', label: 'Vehicle Inspection Certificate', required: true },
    { key: 'vehicleInsurancePolicy', label: 'Vehicle Insurance Policy', required: true },
    { key: 'chauffeurCardFront', label: 'Chauffeur Card Front', required: true },
    { key: 'chauffeurCardBack', label: 'Chauffeur Card Back', required: true },
    { key: 'vog', label: 'Background check (VOG)', required: true },
  ];

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Upload files to Supabase Storage
      const documentsWithUrls = await Promise.all(
        documentFields.map(async (f, i) => {
          let fileUrl = null;
          let mimeType = null;
          
          if (documents[f.key]) {
             try {
               const file = documents[f.key]!;
               mimeType = file.type;
               
               if (supabase) {
                 const fileExt = file.name.split('.').pop();
                 const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
                 const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${safeFileName}`;
                 
                 // We proberen de emmer genaamd 'documents' (of 'partner_documents')
                 const bucketName = 'uploads'; 
                 
                 const { data, error } = await supabase.storage
                   .from(bucketName)
                   .upload(fileName, file);
                   
                 if (error) {
                   console.error("Supabase file upload error:", error);
                   alert(`File upload failed (${error.message}). Please check whether bucket '${bucketName}' exists and whether RLS policies (Insert access) are configured correctly.`);
                 } else if (data) {
                   const { data: urlData } = supabase.storage
                     .from(bucketName)
                     .getPublicUrl(data.path);
                   fileUrl = urlData.publicUrl;
                 }
               }
             } catch (err) {
               console.error("Failed to upload file to Supabase", err);
               fileUrl = null; 
             }
          }
          
          return {
            id: i,
            name: documents[f.key] ? documents[f.key]!.name : 'Missing',
            date: new Date().toISOString().split('T')[0],
            status: documents[f.key] ? 'Pending' : 'Missing',
            fileUrl: fileUrl, // URL van Supabase Storage
            mimeType: mimeType
          };
        })
      );

      const newPartnerDetails = {
        ...formData,
        documents: documentsWithUrls
      };

      if (supabase) {
        try {
          const { error } = await supabase.from('partner_registrations').insert([
            {
              company: formData.companyName,
              contact: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              total_rides: 0,
              status: 'Pending',
              details: newPartnerDetails
            }
          ]);
          if (error) {
            console.error("Supabase insert error:", error);
            if (error.code === '42P01') {
              alert('Supabase table "partner_registrations" is missing. Please run the SQL query from /supabase-partner-table.sql in your Supabase SQL editor.');
            } else {
              alert(`Supabase error: ${error.message}. (The files may be too large)`);
            }
          }
        } catch (err) {
          console.error("Database error:", err);
          alert(`Something went wrong while saving: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Save to localStorage for the Admin panel to pick up as fallback
      try {
        const existingStr = localStorage.getItem('partner_registrations') || '[]';
        const existing = JSON.parse(existingStr);
        const newPartnerLocal = {
          id: `P-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          company: formData.companyName,
          contact: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          totalRides: 0,
          status: 'Pending',
          details: newPartnerDetails,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('partner_registrations', JSON.stringify([...existing, newPartnerLocal]));
      } catch(err) {
        console.error('Failed to save partner registration locally', err);
        // We will not alert this unless Supabase also failed, to avoid dual errors.
      }

      setSubmitted(true);
    } catch (e: any) {
      alert(`Unexpected error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-zinc-200 p-8 md:p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-zinc-900">Application Received</h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Thank you for your interest in Pickupr. We will process your application as soon as possible and contact you.
          </p>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-emerald-700 transition-colors"
          >
            Back to home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 relative overflow-hidden">
      
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
          className="inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          
          <div className="lg:col-span-5 flex flex-col justify-start lg:pt-6">
            
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-zinc-900 mb-5 leading-[1.02]">
              Become a
              <span className="text-emerald-600"> partner</span>
              <br /> with Pickupr.
            </h1>
            
            <p className="text-lg text-zinc-600 mb-8 max-w-xl">
              Join our chauffeur network across the Netherlands and receive higher-quality rides, stable payouts, and an onboarding process that is actually clear.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg">
              <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Avg. Response</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">24h</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Payout</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">Weekly</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Coverage</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">NL</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">Reliable income</h3>
                  <p className="text-zinc-600 text-sm">Clients pay upfront and payouts are bundled weekly. Less friction, more driving.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">Flexible planning</h3>
                  <p className="text-zinc-600 text-sm">Accept rides that match your schedule and preferred service area.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">Top requests</h3>
                  <p className="text-zinc-600 text-sm">Airport transfers, intercity rides, and business hourly bookings.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 md:p-8 shadow-lg relative z-10">
              <div className="mb-6 pb-6 border-b border-zinc-200">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Partner Application</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">{currentStep === 1 ? 'Step 1/2' : 'Step 2/2'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`h-2 rounded-full ${currentStep >= 1 ? 'bg-emerald-500' : 'bg-zinc-200'}`}></div>
                  <div className={`h-2 rounded-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-zinc-200'}`}></div>
                </div>
                <p className="text-zinc-600 text-sm mt-3">Complete your details first, then upload required documents.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Company Name *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Contact Person *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="+31 6 12345678"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="info@company.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Chamber of Commerce (KVK) *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.kvkNumber}
                        onChange={(e) => setFormData({...formData, kvkNumber: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="12345678"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Tax Number *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="NL123456789B01"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">Bank Account Number (IBAN) *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="NL99 INGB 0123 4567 89"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm text-zinc-600 font-medium">BIC Code *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.bicCode}
                        onChange={(e) => setFormData({...formData, bicCode: e.target.value})}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="INGBNL2A"
                      />
                    </div>

                    <div className="pt-2 md:col-span-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          if(formData.companyName && formData.contactPerson && formData.phone && formData.email && formData.kvkNumber && formData.taxNumber && formData.bankAccountNumber && formData.bicCode) {
                            setCurrentStep(2);
                          } else {
                            alert('Please complete all fields first.');
                          }
                        }}
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                      >
                        Next Step <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="pt-2">
                      <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-4">Required Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documentFields.map((field) => (
                          <div key={field.key} className="space-y-1.5">
                            <label className="text-sm text-zinc-600 font-medium">
                              {field.label} {field.required && '*'}
                            </label>
                            <div className="relative">
                              <input 
                                type="file" 
                                onChange={(e) => handleFileUpload(field.key, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                              <div className={`w-full border ${documents[field.key] ? 'border-green-500/50 bg-green-500/5' : 'border-zinc-300 bg-white'} rounded-xl px-4 py-3 flex items-center justify-between transition-colors`}>
                                <span className={`text-sm truncate mr-4 ${documents[field.key] ? 'text-green-500' : 'text-zinc-500'}`}>
                                  {documents[field.key] ? documents[field.key]?.name : 'Choose a file...'}
                                </span>
                                {documents[field.key] ? (
                                   <FileIcon className="w-5 h-5 text-green-500 shrink-0" />
                                ) : (
                                   <Upload className="w-5 h-5 text-zinc-500 shrink-0" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep(1)}
                        className="bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-bold px-6 py-4 rounded-xl transition-all flex items-center justify-center"
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit application'} {!isSubmitting && <Check className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-center text-xs text-zinc-600 mt-4">
                      By submitting, you agree to our partner terms and conditions.
                    </p>
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
