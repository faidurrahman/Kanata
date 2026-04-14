import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquareWarning, ExternalLink, IdCard, FileText, Stethoscope, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const services = [
  { name: "Layanan KK/KTP", icon: IdCard },
  { name: "Layanan Perizinan", icon: FileText },
  { name: "Layanan Kesehatan", icon: Stethoscope },
  { name: "Keamanan & Ketertiban", icon: ShieldCheck },
];

export default function ReviewGate() {
  const [selectedService, setSelectedService] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdDg6f0ti1LNXEc5zTNNi9fQ7CnoeISRI3--QdxwDWGc8ZXCwCp0q553d8EPxfBt15/exec';

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mengirim data ke Google Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk menghindari masalah CORS di browser
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          service: selectedService,
          rating,
          feedback,
          contact,
          timestamp: new Date().toISOString(),
        }),
      });

      // Karena mode 'no-cors', kita asumsikan berhasil jika tidak ada error jaringan
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Terjadi kesalahan saat mengirim masukan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#0056b3] p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Survei Kepuasan Pelayanan Kecamatan</h1>
          <p className="text-blue-100 text-sm">
            Penilaian Anda sangat berarti untuk evaluasi dan peningkatan kualitas pelayanan kami.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              !selectedService ? (
                // Step 1: Service Selection
                <motion.div
                  key="service-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Jenis Layanan</h2>
                    <p className="text-slate-500 mt-2">Layanan apa yang Anda gunakan di Kecamatan Ujung Pandang?</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setSelectedService(s.name)}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#0056b3] hover:shadow-md transition-all group"
                      >
                        <s.icon className="w-10 h-10 text-slate-400 group-hover:text-[#0056b3] mb-3 transition-colors" />
                        <span className="font-semibold text-slate-700 group-hover:text-[#0056b3] transition-colors">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // Step 2: Star Rating & Feedback
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Back Button */}
                  <button 
                    onClick={() => {
                      setSelectedService('');
                      setRating(0);
                    }}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-[#0056b3] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali pilih layanan
                  </button>

                  {/* Star Rating Component */}
                  <div className="text-center space-y-4">
                    <div className="inline-block px-3 py-1 bg-blue-50 text-[#0056b3] rounded-full text-xs font-bold mb-2">
                      {selectedService}
                    </div>
                    <p className="text-slate-600 font-medium">Bagaimana pengalaman Anda hari ini?</p>
                    <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Logic based on Rating */}
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-slate-100"
                  >
                    {rating >= 4 ? (
                      // Rating 4-5: Redirect to Google Maps
                      <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Terima Kasih!</h3>
                        <p className="text-slate-600 text-sm">
                          Kami sangat senang Anda puas dengan pelayanan kami.
                        </p>
                        <a
                          href="https://g.page/r/CRK2Oc0N-GT4EAE/review"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-[#0056b3] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                        >
                          Bantu Kami Bagikan Pengalaman Anda di Google!
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    ) : (
                      // Rating 1-3: Internal Feedback Form
                      <form onSubmit={handleSubmitFeedback} className="space-y-5">
                        <div className="flex items-start gap-3 p-4 bg-orange-50 text-orange-800 rounded-xl mb-6">
                          <MessageSquareWarning className="w-6 h-6 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium">
                            Mohon maaf atas ketidaknyamanan Anda. Ceritakan apa yang perlu kami perbaiki agar kami bisa mengevaluasi pelayanan kami.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="feedback" className="block text-sm font-semibold text-slate-700">
                            Detail Keluhan / Masukan <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="feedback"
                            required
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none transition-all resize-none text-sm"
                            placeholder="Tuliskan pengalaman Anda di sini..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="contact" className="block text-sm font-semibold text-slate-700">
                            Nomor HP / Email <span className="text-slate-400 font-normal">(Opsional)</span>
                          </label>
                          <input
                            type="text"
                            id="contact"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 outline-none transition-all text-sm"
                            placeholder="Agar kami dapat menghubungi Anda kembali"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting || !feedback.trim()}
                          className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md transition-all"
                        >
                          {isSubmitting ? 'Mengirim...' : 'Kirim Masukan'}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </motion.div>
              )
            ) : (
              // Success State for Internal Feedback
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Laporan Diterima</h3>
                <p className="text-slate-600">
                  Terima kasih atas masukan Anda. Kami akan segera menindaklanjuti keluhan ini untuk meningkatkan pelayanan kami.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedService('');
                    setRating(0);
                    setFeedback('');
                    setContact('');
                  }}
                  className="mt-6 text-[#0056b3] font-semibold hover:underline"
                >
                  Kembali ke awal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
