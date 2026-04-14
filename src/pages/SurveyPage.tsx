import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, Loader2, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  'Pelayanan Administrasi Kependudukan (Adminduk)',
  'Pelayanan Non-Perizinan (Surat Keterangan & Rekomendasi)',
  'Pelayanan Kesejahteraan Sosial & Pemberdayaan',
  'Lainnya'
];

const waktuOptions = ['08.00 - 12.00', '13.00 - 17.00'];
const pendidikanOptions = ['SD / Sederajat', 'SMP / Sederajat', 'SMA / Sederajat', 'D3 / Diploma', 'S1 / Sarjana', 'S2 / S3'];
const pekerjaanOptions = ['PNS', 'TNI', 'Polri', 'Swasta', 'Wirausaha', 'Lainnya'];

const questions = [
  { id: 'q1', label: 'Kesesuaian persyaratan pelayanan', options: ['Tidak sesuai', 'Kurang sesuai', 'Sesuai', 'Sangat sesuai'] },
  { id: 'q2', label: 'Kemudahan prosedur pelayanan', options: ['Tidak mudah', 'Kurang mudah', 'Mudah', 'Sangat mudah'] },
  { id: 'q3', label: 'Kecepatan waktu pelayanan', options: ['Tidak cepat', 'Kurang cepat', 'Cepat', 'Sangat cepat'] },
  { id: 'q4', label: 'Kewajaran biaya/tarif', options: ['Sangat mahal', 'Cukup mahal', 'Murah', 'Gratis'] },
  { id: 'q5', label: 'Kesesuaian produk pelayanan dengan standar', options: ['Tidak sesuai', 'Kurang sesuai', 'Sesuai', 'Sangat sesuai'] },
  { id: 'q6', label: 'Kompetensi/kemampuan petugas', options: ['Tidak kompeten', 'Kurang kompeten', 'Kompeten', 'Sangat kompeten'] },
  { id: 'q7', label: 'Perilaku petugas (kesopanan dan keramahan)', options: ['Tidak sopan dan ramah', 'Kurang sopan dan ramah', 'Sopan dan ramah', 'Sangat sopan dan ramah'] },
  { id: 'q8', label: 'Kualitas sarana dan prasarana', options: ['Buruk', 'Cukup', 'Baik', 'Sangat Baik'] },
  { id: 'q9', label: 'Penanganan pengaduan pengguna layanan', options: ['Tidak ada', 'Ada tetapi tidak berfungsi', 'Berfungsi kurang maksimal', 'Dikelola dengan baik'] },
];

interface SurveyPageProps {
  onClose?: () => void;
}

export default function SurveyPage({ onClose }: SurveyPageProps = {}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    layanan: '',
    layananLainnya: '',
    jenisKelamin: '',
    usia: '',
    pendidikan: '',
    pekerjaan: '',
    q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0,
    saran: ''
  });

  const updateData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    const scrollContainer = document.getElementById('survey-scroll-container');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };
  
  const handleBack = () => {
    const scrollContainer = document.getElementById('survey-scroll-container');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Calculate average rating for backward compatibility with existing dashboard
    const avgRaw = (formData.q1 + formData.q2 + formData.q3 + formData.q4 + formData.q5 + formData.q6 + formData.q7 + formData.q8 + formData.q9) / 9;
    
    const payload = {
        timestamp: new Date().toISOString(),
        nama: formData.nama,
        tanggal: formData.tanggal,
        waktu: formData.waktu,
        layanan: formData.layanan === 'Lainnya' ? `Lainnya : ${formData.layananLainnya}` : formData.layanan,
        jenisKelamin: formData.jenisKelamin,
        usia: formData.usia,
        pendidikan: formData.pendidikan,
        pekerjaan: formData.pekerjaan,
        'q1 (Kesesuaian persyaratan)': formData.q1, 
        'q2 (Kemudahan prosedur)': formData.q2, 
        'q3 (Kecepatan waktu)': formData.q3, 
        'q4 (Kewajaran biaya)': formData.q4, 
        'q5 (Kesesuaian produk)': formData.q5, 
        'q6 (Kompetensi petugas)': formData.q6, 
        'q7 (Perilaku petugas)': formData.q7, 
        'q8 (Kualitas sarana)': formData.q8, 
        'q9 (Penanganan Pengaduan)': formData.q9,
        saran: formData.saran
    };

    try {
        // URL Webhook Google Apps Script Anda
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRm52EV9iAggxpIlS_wQQ23NrBAOQmArORxlEqT3qG0n307DEH6Frpqg-79-9t1l5N/exec';
        
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // keep no-cors for Google Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });
    } catch (err) {
        console.error('Google Sheets Error', err);
    }

    setStep(4);
    setIsSubmitting(false);
  };

  const isStep1Valid = 
    formData.tanggal !== '' && 
    formData.waktu !== '' && 
    formData.layanan !== '' && 
    (formData.layanan !== 'Lainnya' || formData.layananLainnya.trim() !== '') &&
    formData.jenisKelamin !== '' && 
    formData.usia !== '' && 
    formData.pendidikan !== '' && 
    formData.pekerjaan !== '';

  const isStep2Valid = 
    formData.q1 > 0 && formData.q2 > 0 && formData.q3 > 0 && 
    formData.q4 > 0 && formData.q5 > 0 && formData.q6 > 0 && 
    formData.q7 > 0 && formData.q8 > 0 && formData.q9 > 0;

  const content = (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0056b3] p-6 md:p-8 text-center relative shrink-0">
          {onClose && (
            <button onClick={handleCancel} className="absolute left-4 top-4 text-white/80 hover:text-white p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <img src="https://drive.google.com/thumbnail?id=1BU0DPMBjVe379MQ7Rczjn3_s4DAEa5L9&sz=w500" alt="Logo KANATA" className="w-16 h-16 object-contain mx-auto mb-3 bg-white rounded-xl p-1" referrerPolicy="no-referrer" />
          <h1 className="text-lg md:text-xl font-black text-white mb-1.5 leading-tight">
            KUESIONER KANATA'<br/>
            <span className="text-sm md:text-base font-medium text-blue-100 block mt-1">Kotak Aspirasi dan PeNilaian MasyarAkat Transparan & Akuntabel</span>
            <span className="text-sm md:text-base font-bold text-blue-100 block mt-1">KECAMATAN UJUNG PANDANG KOTA MAKASSAR</span>
          </h1>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="w-full h-1.5 bg-slate-100 shrink-0">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Scrollable Content Area */}
        <div id="survey-scroll-container" className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Profil Responden */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-5 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800">Profil Responden</h2>
                  <p className="text-xs md:text-sm text-slate-500">Mohon lengkapi data diri Anda di bawah ini.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">Nama Lengkap <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => updateData('nama', e.target.value)}
                      placeholder="Masukkan nama Anda..."
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Tanggal Survei <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      readOnly
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-medium"
                    />
                  </div>

                  {/* Waktu */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Waktu <span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      value={formData.waktu}
                      readOnly
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-medium"
                    />
                  </div>

                  {/* Jenis Layanan */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">Jenis Layanan yang Diterima <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.layanan}
                        onChange={(e) => updateData('layanan', e.target.value)}
                        className="w-full p-3 text-sm pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none appearance-none transition-all font-medium text-slate-700"
                      >
                        <option value="" disabled>Pilih jenis layanan...</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {formData.layanan === 'Lainnya' && (
                      <input
                        type="text"
                        value={formData.layananLainnya}
                        onChange={(e) => updateData('layananLainnya', e.target.value)}
                        placeholder="Tuliskan jenis layanan lainnya..."
                        className="w-full mt-2 p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none transition-all font-medium text-slate-700"
                      />
                    )}
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateData('jenisKelamin', 'L')}
                        className={`flex-1 py-3 text-sm rounded-xl border-2 font-bold transition-all ${formData.jenisKelamin === 'L' ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        Laki-laki (L)
                      </button>
                      <button
                        onClick={() => updateData('jenisKelamin', 'P')}
                        className={`flex-1 py-3 text-sm rounded-xl border-2 font-bold transition-all ${formData.jenisKelamin === 'P' ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        Perempuan (P)
                      </button>
                    </div>
                  </div>

                  {/* Usia */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Usia (Tahun) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={formData.usia}
                      onChange={(e) => updateData('usia', e.target.value)}
                      placeholder="Contoh: 35"
                      className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>

                  {/* Pendidikan */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Pendidikan Terakhir <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.pendidikan}
                        onChange={(e) => updateData('pendidikan', e.target.value)}
                        className="w-full p-3 text-sm pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none appearance-none transition-all font-medium text-slate-700"
                      >
                        <option value="" disabled>Pilih pendidikan...</option>
                        {pendidikanOptions.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Pekerjaan */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Pekerjaan Utama <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.pekerjaan}
                        onChange={(e) => updateData('pekerjaan', e.target.value)}
                        className="w-full p-3 text-sm pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none appearance-none transition-all font-medium text-slate-700"
                      >
                        <option value="" disabled>Pilih pekerjaan...</option>
                        {pekerjaanOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-5 flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="w-1/3 py-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="w-2/3 py-3 text-sm bg-[#0056b3] hover:bg-[#004494] disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Lanjut ke Kuesioner <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Kuesioner Pelayanan */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="mb-4 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800">Pendapat Responden</h2>
                  <p className="text-xs md:text-sm text-slate-500">Pilih salah satu jawaban yang paling sesuai dengan pengalaman Anda.</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:space-y-4">
                      <p className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                        <span className="text-[#0056b3] mr-2">{idx + 1}.</span> {q.label}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((optLabel, optIdx) => {
                          const value = optIdx + 1; // 1 to 4
                          const isSelected = formData[q.id as keyof typeof formData] === value;
                          const emojis = ["😠", "🙁", "🙂", "😍"];
                          return (
                            <button
                              key={value}
                              onClick={() => updateData(q.id, value)}
                              className={`text-left px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 transition-all text-xs sm:text-sm font-semibold flex items-center justify-between ${
                                isSelected
                                  ? 'bg-blue-50 border-[#0056b3] text-[#0056b3]'
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className={`inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full text-center leading-[18px] sm:leading-5 border mr-2 sm:mr-3 text-[10px] sm:text-xs font-bold shrink-0
                                  ${isSelected ? 'border-[#0056b3] bg-[#0056b3] text-white' : 'border-slate-300 text-slate-400'}`}>
                                  {value}
                                </span>
                                {optLabel}
                              </div>
                              <span className="text-lg sm:text-xl ml-2">{emojis[optIdx]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-100">
                  <button
                    onClick={handleBack}
                    className="w-1/3 py-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isStep2Valid}
                    className="w-2/3 py-3 text-sm bg-[#0056b3] hover:bg-[#004494] disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Lanjut <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Saran & Kirim */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-5 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800">Saran & Masukan</h2>
                  <p className="text-xs md:text-sm text-slate-500">Berikan saran Anda untuk peningkatan kualitas pelayanan kami.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">SARAN DAN MASUKAN <span className="text-slate-400 font-normal">(Opsional)</span></label>
                  <textarea
                    rows={6}
                    value={formData.saran}
                    onChange={(e) => updateData('saran', e.target.value)}
                    placeholder="Tuliskan masukan, kritik, atau saran Anda di sini..."
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none resize-none transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="w-1/3 py-3 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-2/3 py-3 text-sm bg-[#0056b3] hover:bg-[#004494] disabled:bg-[#0056b3]/70 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                      </>
                    ) : (
                      'Kirim Kuesioner'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success Screen */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800">Terima Kasih!</h2>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    Kuesioner Anda telah berhasil dikirim. Terima kasih atas partisipasi Anda dalam membangun Kecamatan Ujung Pandang.
                  </p>
                </div>
                <div className="pt-6">
                  <button
                    onClick={handleCancel}
                    className="w-full py-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    Selesai
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 font-sans">
      {content}
    </div>
  );
}
