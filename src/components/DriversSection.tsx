import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, GraduationCap, Users } from 'lucide-react';

export default function DriversSection() {
  return (
    <section className="py-32 bg-white text-zinc-950 overflow-hidden relative border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-widest rounded-full mb-6 shadow-sm">
            <Star className="w-4 h-4" /> Elite Chauffeurs
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-sans tracking-tight mb-6 text-zinc-900">
            The Masters Behind The Wheel
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed">
            Out of thousands of applicants, only a highly select cadre of professionals meet our uncompromising standards for safety, discretion, and luxury hospitality.
          </p>
        </div>
            
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-zinc-200 p-8 lg:p-10 rounded-3xl hover:bg-emerald-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-2xl mb-8 group-hover:scale-110 transition-transform">
              1
            </div>
            <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-zinc-900">
              <Users className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600 transition-colors" /> Rigorous Selection
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              Every candidate undergoes a profound personal evaluation to ensure impeccable manners, emotional intelligence, and unwavering discretion before ever getting behind the wheel.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-zinc-200 p-8 lg:p-10 rounded-3xl hover:bg-emerald-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-2xl mb-8 group-hover:scale-110 transition-transform">
              2
            </div>
            <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-zinc-900">
              <ShieldCheck className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600 transition-colors" /> Absolute Security
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              We conduct exhaustive background checks, global vetting, and detailed driving history reviews, guaranteeing absolute peace of mind and uncompromising security for our guests.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border border-zinc-200 p-8 lg:p-10 rounded-3xl hover:bg-emerald-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-2xl mb-8 group-hover:scale-110 transition-transform">
              3
            </div>
            <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-zinc-900">
              <GraduationCap className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600 transition-colors" /> Five-Star Hospitality
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              Our chauffeurs master elite hospitality protocols, advanced defensive driving techniques, and the fine art of anticipating our clients' needs to deliver a flawless journey.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
