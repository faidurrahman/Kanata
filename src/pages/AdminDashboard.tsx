import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, Star, TrendingDown, FileText, ArrowLeft, LayoutDashboard, MessageSquare, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const INDICATORS = {
  q1: 'Persyaratan', q2: 'Prosedur', q3: 'Waktu', q4: 'Biaya',
  q5: 'Produk', q6: 'Kompetensi', q7: 'Perilaku', q8: 'Sarana', q9: 'Pengaduan'
};

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRm52EV9iAggxpIlS_wQQ23NrBAOQmArORxlEqT3qG0n307DEH6Frpqg-79-9t1l5N/exec';
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const json = await res.json();
        
        if (json.status === 'success' && json.data) {
          const formattedData = json.data.map((item: any) => {
            // Helper to find the Q value regardless of the exact column header string
            const getQValue = (qNum: number) => {
              const key = Object.keys(item).find(k => k.toLowerCase().startsWith(`q${qNum}`));
              return key ? Number(item[key]) || 0 : 0;
            };

            return {
              tanggal: item.tanggal || item.timestamp,
              layanan: item.layanan || 'Layanan Umum',
              jenisKelamin: item.jenisKelamin || 'L',
              usia: Number(item.usia) || 0,
              pendidikan: item.pendidikan || 'Lainnya',
              pekerjaan: item.pekerjaan || 'Lainnya',
              q1: getQValue(1),
              q2: getQValue(2),
              q3: getQValue(3),
              q4: getQValue(4),
              q5: getQValue(5),
              q6: getQValue(6),
              q7: getQValue(7),
              q8: getQValue(8),
              q9: getQValue(9),
              saran: item.saran || ''
            };
          });
          
          // Filter out empty rows if any
          const validData = formattedData.filter((d: any) => d.q1 > 0);
          setRawData(validData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Kalkulasi Agregat
  const { 
    totalResponden, 
    overallAvg, 
    topService, 
    lowestIndicator, 
    indicatorData,
    genderData,
    eduData
  } = useMemo(() => {
    if (rawData.length === 0) {
      return {
        totalResponden: 0,
        overallAvg: "0.00",
        topService: "-",
        lowestIndicator: { id: "-", name: "-", score: 0 },
        indicatorData: [],
        genderData: [],
        eduData: []
      };
    }

    const total = rawData.length;

    // 1. Rata-rata per Indikator
    const qAverages = Object.keys(INDICATORS).map(key => {
      const sum = rawData.reduce((acc, curr) => acc + (curr[key as keyof typeof rawData[0]] as number), 0);
      return {
        id: key.toUpperCase(),
        name: INDICATORS[key as keyof typeof INDICATORS],
        score: Number((sum / total).toFixed(2))
      };
    });

    // 2. Indeks Kepuasan Rata-rata Keseluruhan
    const overall = (qAverages.reduce((acc, curr) => acc + curr.score, 0) / 9).toFixed(2);

    // 3. Indikator Terendah
    const lowest = [...qAverages].sort((a, b) => a.score - b.score)[0];

    // 4. Layanan Terbanyak
    const serviceCounts = rawData.reduce((acc: any, curr) => {
      acc[curr.layanan] = (acc[curr.layanan] || 0) + 1;
      return acc;
    }, {});
    const topSrv = Object.keys(serviceCounts).sort((a, b) => serviceCounts[b] - serviceCounts[a])[0];

    // 5. Demografi Jenis Kelamin
    const genderCounts = rawData.reduce((acc: any, curr) => {
      acc[curr.jenisKelamin] = (acc[curr.jenisKelamin] || 0) + 1;
      return acc;
    }, {});
    const genderChart = [
      { name: 'Laki-laki', value: genderCounts['L'] || 0, color: '#3b82f6' },
      { name: 'Perempuan', value: genderCounts['P'] || 0, color: '#ec4899' }
    ].filter(item => item.value > 0);

    // 6. Demografi Pendidikan
    const eduCounts = rawData.reduce((acc: any, curr) => {
      acc[curr.pendidikan] = (acc[curr.pendidikan] || 0) + 1;
      return acc;
    }, {});
    const eduChart = Object.keys(eduCounts).map((key, i) => ({
      name: key,
      value: eduCounts[key],
      color: COLORS[i % COLORS.length]
    }));

    return {
      totalResponden: total,
      overallAvg: overall,
      topService: topSrv,
      lowestIndicator: lowest,
      indicatorData: qAverages,
      genderData: genderChart,
      eduData: eduChart
    };
  }, [rawData]);

  // Custom Tooltip for BarChart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800">{`${label} : ${payload[0].payload.name}`}</p>
          <p className="text-blue-600 font-semibold">{`Skor: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center font-sans text-slate-900">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Memuat Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      
      {/* Navbar / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <img src="https://drive.google.com/thumbnail?id=1BU0DPMBjVe379MQ7Rczjn3_s4DAEa5L9&sz=w500" alt="Logo KANATA" className="w-10 h-10 object-contain hidden sm:block" referrerPolicy="no-referrer" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">Dashboard KANATA'</h1>
                <p className="text-sm text-slate-500 font-medium">Kecamatan Ujung Pandang, Kota Makassar</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Executive View
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Total Responden</p>
                  <h3 className="text-3xl font-black text-slate-800">{totalResponden}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Indeks Kepuasan</p>
                  <h3 className="text-3xl font-black text-emerald-600">{overallAvg} <span className="text-base font-medium text-slate-400">/ 4.00</span></h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Layanan Terbanyak</p>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mt-1">{topService}</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Indikator Terendah</p>
                  <h3 className="text-lg font-bold text-rose-600 leading-tight mt-1">
                    {lowestIndicator.id}: {lowestIndicator.name} ({lowestIndicator.score})
                  </h3>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Bar Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-800">Kinerja per Indikator (Q1 - Q9)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={indicatorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="score" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40}>
                      {indicatorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score < 3.5 ? '#f59e0b' : '#0ea5e9'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 justify-center">
                {indicatorData.map(ind => (
                  <span key={ind.id}><strong className="text-slate-700">{ind.id}</strong>={ind.name}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Demographics */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white h-[calc(50%-12px)]">
              <CardHeader className="pb-0">
                <CardTitle className="text-base text-slate-800">Demografi: Jenis Kelamin</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[180px]">
                {genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value">
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">Belum ada data</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white h-[calc(50%-12px)]">
              <CardHeader className="pb-0">
                <CardTitle className="text-base text-slate-800">Demografi: Pendidikan</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[180px]">
                {eduData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={eduData} cx="40%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                        {eduData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569', width: '100px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">Belum ada data</div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Table Section */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Suara Warga (Saran & Masukan)
            </CardTitle>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Lihat Semua
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Layanan</th>
                    <th className="px-6 py-4 font-semibold">Saran & Masukan</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Belum ada data saran masuk.</td>
                    </tr>
                  )}
                  {rawData.slice().reverse().slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {row.layanan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 min-w-[300px]">
                        "{row.saran}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
