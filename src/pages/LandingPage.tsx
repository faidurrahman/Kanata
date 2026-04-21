import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowRight, MapPin, ShieldCheck, Zap, Users, Award, QrCode, LayoutDashboard } from 'lucide-react';
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
          <div className="flex flex-col justify-center">
            <span className="font-bold text-lg tracking-tight leading-none">Kecamatan</span>
            <span className="font-bold text-lg tracking-tight leading-none">Ujung Pandang</span>
          </div>
        </div>
        <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin')} 
              className="w-10 h-10 rounded-full text-slate-500 hover:text-[#0056b3] hover:bg-blue-50 transition-all"
              title="Dashboard Admin"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center justify-center space-y-6"
        >
          <motion.div variants={item} className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0056b3] text-sm font-bold tracking-widest uppercase shadow-sm">
            Aplikasi
          </motion.div>
          <motion.h1 variants={item} className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.25] md:leading-[1.15]">
            Survei Kepuasan Masyarakat <br />
            <span className="text-[#0056b3] text-2xl md:text-4xl lg:text-5xl mt-2 inline-block">Kecamatan Ujung Pandang</span>
          </motion.h1>
          <motion.p variants={item} className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed mx-auto px-4">
            Suara Anda adalah kunci kemajuan pelayanan publik kita. Berikan penilaian dan masukan Anda untuk Kecamatan Ujung Pandang yang lebih baik.
          </motion.p>
          <motion.div variants={item} className="pt-6 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => setShowSurveyModal(true)} className="h-14 px-8 text-base rounded-full bg-[#0056b3] hover:bg-[#004494] shadow-2xl shadow-blue-900/30 transition-all hover:scale-105">
              Beri Nilai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <img src="https://drive.google.com/thumbnail?id=1BU0DPMBjVe379MQ7Rczjn3_s4DAEa5L9&sz=w500" alt="Logo Kecamatan Ujung Pandang" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-lg leading-none">Kecamatan</span>
                  <span className="font-bold text-lg leading-none">Ujung Pandang</span>
                </div>
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
