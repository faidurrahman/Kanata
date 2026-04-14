import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight, MapPin, ShieldCheck, Zap, Users, Award, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SurveyPage from './SurveyPage';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="https://drive.google.com/thumbnail?id=1BU0DPMBjVe379MQ7Rczjn3_s4DAEa5L9&sz=w500" alt="Logo KANATA" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none">KANATA'</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Kecamatan Ujung Pandang</span>
          </div>
        </div>
        <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="font-semibold">Admin</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center justify-center space-y-8"
        >
          <motion.h1 variants={item} className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Selamat Datang di <br/>
            <span className="text-[#0056b3]">KANATA'</span>
          </motion.h1>
          <motion.p variants={item} className="text-base text-slate-500 max-w-lg leading-relaxed mx-auto font-medium">
            Kotak Aspirasi dan PeNilaian MasyarAkat Transparan & Akuntabel
          </motion.p>
          <motion.p variants={item} className="text-sm text-slate-500 max-w-lg leading-relaxed mx-auto mt-2">
            Suara Anda adalah kunci kemajuan Kecamatan kita. Berikan penilaian untuk pelayanan di Kecamatan Ujung Pandang melalui kuesioner ini.
          </motion.p>
          <motion.div variants={item} className="pt-4 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => setShowSurveyModal(true)} className="h-14 px-8 text-base rounded-full bg-[#0056b3] hover:bg-[#004494] shadow-2xl shadow-blue-900/30 transition-all hover:scale-105">
              Beri Nilai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <img src="https://drive.google.com/thumbnail?id=1BU0DPMBjVe379MQ7Rczjn3_s4DAEa5L9&sz=w500" alt="Logo KANATA" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                <span className="font-bold">KANATA'</span>
              </div>
              <p className="text-sm text-slate-400 font-medium">© 2026 Pemerintah Kecamatan Ujung Pandang. Makassar, Indonesia.</p>
          </div>
      </footer>

      {/* Survey Modal */}
      {showSurveyModal && (
        <SurveyPage onClose={() => setShowSurveyModal(false)} />
      )}
    </div>
  );
}
