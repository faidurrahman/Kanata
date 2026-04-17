import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { 
  Users, Star, ArrowLeft, LayoutDashboard, Calendar, Info, MessageSquare, TrendingDown, FileText, Loader2, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const INDICATORS = {
  q1: 'PERSYARATAN', q2: 'PROSEDUR', q3: 'JANGKA WAKTU', q4: 'TARIF',
  q5: 'PRODUK', q6: 'KOMPETENSI', q7: 'PERILAKU', q8: 'SARPRAS', q9: 'PENGADUAN'
};

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filterWaktu, setFilterWaktu] = useState('Semua Waktu');
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuaraWarga, setShowSuaraWarga] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRm52EV9iAggxpIlS_wQQ23NrBAOQmArORxlEqT3qG0n307DEH6Frpqg-79-9t1l5N/exec';
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const json = await res.json();
        
        if (json.status === 'success' && json.data) {
          const formattedData = json.data.map((item: any) => {
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

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const { 
    totalResponden, 
    overallAvg, 
    predikat,
    topService, 
    lowestIndicator, 
    indicatorData,
    genderCounts,
    eduData,
    ageData,
    filteredRawData
  } = useMemo(() => {
    const MONTHS = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const filteredData = rawData.filter(item => {
      if (filterWaktu === 'Semua Waktu') return true;
      if (!item.tanggal) return false;
      const date = new Date(item.tanggal);
      if (isNaN(date.getTime())) return false;
      return MONTHS[date.getMonth()] === filterWaktu;
    });

    if (filteredData.length === 0) {
      return {
        totalResponden: 0,
        overallAvg: "0.00",
        predikat: "-",
        topService: "-",
        lowestIndicator: { id: "-", name: "-", score: 0 },
        indicatorData: [],
        genderCounts: { L: 0, P: 0 },
        eduData: [],
        ageData: [],
        filteredRawData: []
      };
    }

    const total = filteredData.length;

    const qAverages = Object.keys(INDICATORS).map(key => {
      const sum = filteredData.reduce((acc, curr) => acc + (curr[key as keyof typeof filteredData[0]] as number), 0);
      return {
        id: INDICATORS[key as keyof typeof INDICATORS],
        score: Number((sum / total).toFixed(2))
      };
    });

    const overallScore = qAverages.reduce((acc, curr) => acc + curr.score, 0) / 9;
    // Convert to 100 scale for IKM
    const ikmScore = overallScore * 25;
    const overallStr = ikmScore.toFixed(2);

    let pred = "TIDAK BAIK";
    if (ikmScore >= 88.31) pred = "SANGAT BAIK";
    else if (ikmScore >= 76.61) pred = "BAIK";
    else if (ikmScore >= 65.00) pred = "KURANG BAIK";

    const lowest = [...qAverages].sort((a, b) => a.score - b.score)[0];

    const serviceCounts = filteredData.reduce((acc: any, curr) => {
      acc[curr.layanan] = (acc[curr.layanan] || 0) + 1;
      return acc;
    }, {});
    const topSrv = Object.keys(serviceCounts).sort((a, b) => serviceCounts[b] - serviceCounts[a])[0];

    const gCounts = filteredData.reduce((acc: any, curr) => {
      acc[curr.jenisKelamin] = (acc[curr.jenisKelamin] || 0) + 1;
      return acc;
    }, { L: 0, P: 0 });

    const eduCounts = filteredData.reduce((acc: any, curr) => {
      acc[curr.pendidikan] = (acc[curr.pendidikan] || 0) + 1;
      return acc;
    }, {});
    const eData = Object.keys(eduCounts).map((key, i) => ({
      name: key,
      value: eduCounts[key],
      color: COLORS[i % COLORS.length]
    }));

    const ageGroups = {
      '<17 Tahun': 0,
      '17 - 25 Tahun': 0,
      '26 - 35 Tahun': 0,
      '36 - 45 Tahun': 0,
      '46 - 55 Tahun': 0,
      '>55 Tahun': 0
    };

    filteredData.forEach(d => {
      const age = d.usia;
      if (age < 17) ageGroups['<17 Tahun']++;
      else if (age <= 25) ageGroups['17 - 25 Tahun']++;
      else if (age <= 35) ageGroups['26 - 35 Tahun']++;
      else if (age <= 45) ageGroups['36 - 45 Tahun']++;
      else if (age <= 55) ageGroups['46 - 55 Tahun']++;
      else ageGroups['>55 Tahun']++;
    });

    const aData = Object.keys(ageGroups)
      .filter(key => ageGroups[key as keyof typeof ageGroups] > 0)
      .map((key, i) => ({
        name: key,
        value: ageGroups[key as keyof typeof ageGroups],
        color: COLORS[i % COLORS.length]
      }));

    return {
      totalResponden: total,
      overallAvg: overallStr,
      predikat: pred,
      topService: topSrv,
      lowestIndicator: lowest,
      indicatorData: qAverages,
      genderCounts: gCounts,
      eduData: eData,
      ageData: aData,
      filteredRawData: filteredData
    };
  }, [rawData, filterWaktu]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-blue-600 font-semibold">{`Skor: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800">{payload[0].name}</p>
          <p className="text-blue-600 font-semibold">{`Jumlah: ${payload[0].value} orang`}</p>
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
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select 
                value={filterWaktu}
                onChange={(e) => setFilterWaktu(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="Semua Waktu">Semua Waktu</option>
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>
            </div>
            <button 
              onClick={() => setShowSuaraWarga(!showSuaraWarga)}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${showSuaraWarga ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            >
              <MessageSquare className="w-4 h-4" /> Suara Warga
            </button>
            <button 
              onClick={() => setShowSuaraWarga(false)}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors rounded-full text-sm font-bold flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Executive View
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-full"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        
        {showSuaraWarga ? (
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Suara Warga (Saran & Masukan)
              </CardTitle>
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
                    {filteredRawData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Belum ada data saran masuk.</td>
                      </tr>
                    )}
                    {filteredRawData.slice().reverse().map((row, idx) => (
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
        ) : (
          <>
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* IKM Scorecard */}
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white lg:col-span-1">
                <CardContent className="p-6 flex flex-col h-full justify-center relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 opacity-10">
                    <Star className="w-40 h-40" />
                  </div>
                  <p className="text-blue-100 font-medium mb-2 text-lg">Indeks Kepuasan Masyarakat (IKM)</p>
                  <div className="flex items-end gap-3 mb-2">
                    <h2 className="text-6xl font-black tracking-tight">{overallAvg}</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full mt-2">
                    <span className="font-bold text-lg">Predikat: {predikat}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Responden Scorecard */}
              <Card className="border-none shadow-sm bg-white lg:col-span-1">
                <CardContent className="p-6 flex flex-col h-full justify-center">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Total Responden</p>
                      <h3 className="text-4xl font-black text-slate-800">{totalResponden} <span className="text-base font-medium text-slate-400">orang</span></h3>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Users className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Laki-laki</p>
                      <p className="text-xl font-bold text-blue-600">{genderCounts.L}</p>
                    </div>
                    <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Perempuan</p>
                      <p className="text-xl font-bold text-pink-600">{genderCounts.P}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predikat Legend */}
              <Card className="border-none shadow-sm bg-white lg:col-span-1">
                <CardHeader className="pb-2 pt-5">
                  <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Skala Penilaian
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="space-y-3 mt-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-emerald-600">A (Sangat Baik)</span>
                      <span className="text-slate-600 font-medium">88.31 – 100.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-blue-600">B (Baik)</span>
                      <span className="text-slate-600 font-medium">76.61 – 88.30</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-amber-500">C (Kurang Baik)</span>
                      <span className="text-slate-600 font-medium">65.00 – 76.60</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-rose-500">D (Tidak Baik)</span>
                      <span className="text-slate-600 font-medium">25.00 – 64.99</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {lowestIndicator.id} ({lowestIndicator.score})
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
                  <CardTitle className="text-lg text-slate-800">Kinerja per Indikator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={indicatorData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="id" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }} 
                          interval={0}
                        />
                        <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="score" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={36}>
                          <LabelList dataKey="score" position="top" fill="#334155" fontSize={12} fontWeight="bold" />
                          {indicatorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score < 3.5 ? '#3b82f6' : '#0284c7'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Demographics */}
              <div className="space-y-6">
                <Card className="border-none shadow-sm bg-white h-[calc(50%-12px)]">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base text-slate-800">Demografi: Pendidikan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[200px]">
                    {eduData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={eduData} cx="40%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                            {eduData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomPieTooltip />} cursor={{ fill: '#f8fafc' }} />
                          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569', width: '110px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-slate-400">Belum ada data</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white h-[calc(50%-12px)]">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base text-slate-800">Demografi: Interval Umur</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[200px]">
                    {ageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={ageData} cx="40%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomPieTooltip />} cursor={{ fill: '#f8fafc' }} />
                          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569', width: '110px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-slate-400">Belum ada data</div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}

