'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Database, MapPin, Ruler, Home, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import CityPieChart from '@/components/dashboard/CityPieChart';
import AreaBarChart from '@/components/dashboard/AreaBarChart';

interface BasicStats {
  totalLands: number;
  totalAreaM2: number;
  totalAreaPing: number;
  cityCount: number;
}

interface ApiBasicResponse {
  success: boolean;
  data: {
    totalLands: number;
    totalAreaM2: number;
    totalAreaPing: number;
    byCity: Array<{
      city: string;
      count: number;
      areaM2: number;
      areaPing: number;
    }>;
    lastUpdated: string;
  };
}

interface ApiDetailedResponse {
  success: boolean;
  data: {
    byDistrict: Array<{
      city: string;
      district: string;
      count: number;
      areaM2: number;
      areaPing: number;
    }>;
    topLandsByArea: unknown[];
    topDistrictsByCount: unknown[];
    bySection: unknown[];
  };
}

interface CityStats {
  city: string;
  count: number;
  totalAreaM2: number;
  totalAreaPing: number;
  townships: TownshipStats[];
}

interface TownshipStats {
  township: string;
  count: number;
  totalAreaM2: number;
  totalAreaPing: number;
}

interface DetailedStats {
  byCity: CityStats[];
}

export default function DashboardPage() {
  const [basicStats, setBasicStats] = useState<BasicStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const [basicRes, detailedRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/stats/detailed'),
        ]);

        if (!basicRes.ok || !detailedRes.ok) {
          throw new Error('無法載入統計資料');
        }

        const basicResponse: ApiBasicResponse = await basicRes.json();
        const detailedResponse: ApiDetailedResponse = await detailedRes.json();

        // Transform basic stats
        setBasicStats({
          totalLands: basicResponse.data.totalLands,
          totalAreaM2: basicResponse.data.totalAreaM2,
          totalAreaPing: basicResponse.data.totalAreaPing,
          cityCount: basicResponse.data.byCity.length,
        });

        // Transform detailed stats: group byDistrict into byCity with townships
        const cityMap = new Map<string, CityStats>();

        detailedResponse.data.byDistrict.forEach((district) => {
          if (!cityMap.has(district.city)) {
            cityMap.set(district.city, {
              city: district.city,
              count: 0,
              totalAreaM2: 0,
              totalAreaPing: 0,
              townships: [],
            });
          }

          const cityStats = cityMap.get(district.city)!;
          cityStats.count += district.count;
          cityStats.totalAreaM2 += district.areaM2;
          cityStats.totalAreaPing += district.areaPing;
          cityStats.townships.push({
            township: district.district,
            count: district.count,
            totalAreaM2: district.areaM2,
            totalAreaPing: district.areaPing,
          });
        });

        setDetailedStats({
          byCity: Array.from(cityMap.values()),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const toggleCity = (city: string) => {
    setExpandedCities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(city)) {
        newSet.delete(city);
      } else {
        newSet.add(city);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
      {/* Cyberpunk grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-mono hover:bg-amber-500/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            統計儀表板
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4" />
          <p className="text-zinc-400 text-lg font-mono">台灣未繼承土地資料統計分析</p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="ml-3 text-zinc-400 font-mono">載入統計資料中...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Stats Content */}
        {!loading && !error && basicStats && detailedStats && (
          <>
            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatsCard
                title="總筆數"
                value={basicStats.totalLands.toLocaleString()}
                subtitle="未繼承土地資料"
                icon={<Database className="w-6 h-6" />}
              />
              <StatsCard
                title="總面積"
                value={`${basicStats.totalAreaM2.toLocaleString()} m²`}
                subtitle="平方公尺"
                icon={<Ruler className="w-6 h-6" />}
              />
              <StatsCard
                title="總面積"
                value={`${basicStats.totalAreaPing.toLocaleString()} 坪`}
                subtitle="台灣坪數"
                icon={<Ruler className="w-6 h-6" />}
              />
              <StatsCard
                title="縣市數量"
                value={basicStats.cityCount}
                subtitle="覆蓋範圍"
                icon={<MapPin className="w-6 h-6" />}
              />
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <div className="bg-zinc-900/60 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(251,191,36,0.1)]">
                <h2 className="text-xl font-bold text-amber-400 mb-6 font-mono">縣市分布 (圓餅圖)</h2>
                <CityPieChart data={detailedStats.byCity.map(city => ({
                  city: city.city,
                  count: city.count
                }))} />
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(251,191,36,0.1)]">
                <h2 className="text-xl font-bold text-amber-400 mb-6 font-mono">面積分布 (條形圖)</h2>
                <AreaBarChart data={detailedStats.byCity.flatMap(city =>
                  city.townships.map(township => ({
                    district: `${city.city} ${township.township}`,
                    areaM2: township.totalAreaM2
                  }))
                )} />
              </div>
            </section>

            {/* Detailed Table Section */}
            <section className="bg-zinc-900/60 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(251,191,36,0.1)]">
              <h2 className="text-2xl font-bold text-amber-400 mb-6 font-mono">詳細統計表</h2>

              <div className="space-y-4">
                {detailedStats.byCity.map((city) => (
                  <div
                    key={city.city}
                    className="border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    {/* City Header */}
                    <button
                      onClick={() => toggleCity(city.city)}
                      className="w-full flex items-center justify-between px-6 py-4 bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <MapPin className="w-5 h-5 text-amber-400" />
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-zinc-100">{city.city}</h3>
                          <p className="text-sm text-zinc-400 font-mono">
                            {city.count.toLocaleString()} 筆 | {city.totalAreaPing.toLocaleString()} 坪
                          </p>
                        </div>
                      </div>
                      {expandedCities.has(city.city) ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>

                    {/* Township Details */}
                    {expandedCities.has(city.city) && (
                      <div className="bg-zinc-900/30 px-6 py-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-zinc-800">
                                <th className="text-left py-2 px-2 text-cyan-400 font-mono">鄉鎮市區</th>
                                <th className="text-right py-2 px-2 text-cyan-400 font-mono">筆數</th>
                                <th className="text-right py-2 px-2 text-cyan-400 font-mono">面積 (m²)</th>
                                <th className="text-right py-2 px-2 text-cyan-400 font-mono">面積 (坪)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {city.townships.map((township) => (
                                <tr
                                  key={township.township}
                                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                                >
                                  <td className="py-2 px-2 text-zinc-300">{township.township}</td>
                                  <td className="py-2 px-2 text-right text-zinc-300 font-mono">
                                    {township.count.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-2 text-right text-zinc-300 font-mono">
                                    {township.totalAreaM2.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-2 text-right text-zinc-300 font-mono">
                                    {township.totalAreaPing.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 font-mono hover:bg-amber-500/30 transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首頁搜尋
          </Link>
        </footer>
      </main>
    </div>
  );
}
