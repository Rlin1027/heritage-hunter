'use client';

import { useState, useEffect } from 'react';
import { Zap, Map, BookOpen, List, Search, Scale, Database, Loader2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import HunterSearch from '@/components/HunterSearch';
import BountyList from '@/components/BountyList';
import TreasureMap from '@/components/TreasureMap';
import HowToClaimModal from '@/components/HowToClaimModal';
import { useSearch, useStatistics, useDataSource } from '@/lib/hooks';
import type { SearchFilters } from '@/lib/types';

export default function Home() {
  const { results, loading, error, total, search: performSearch } = useSearch();
  const { stats } = useStatistics();
  const { source: dataSource } = useDataSource();
  const [hasSearched, setHasSearched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleSearch = async (filters: SearchFilters) => {
    await performSearch(filters);
    setHasSearched(true);
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
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            繼承者們
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4" />
          <p className="text-zinc-400 text-lg font-mono">Heritage Hunter - 台灣未繼承土地尋寶網</p>

          {/* Data Source Indicator */}
          {dataSource && (
            <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-xs font-mono ${dataSource === 'api'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              }`}>
              <Database className="w-3 h-3" />
              {dataSource === 'api' ? '即時資料庫' : '本地示範資料'}
            </div>
          )}

          {/* Dashboard Navigation */}
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              <BarChart3 className="w-5 h-5" />
              <span>統計儀表板</span>
            </Link>
          </div>
        </header>

        {/* Hero Search Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-8 md:p-12 shadow-[0_0_60px_rgba(251,191,36,0.1)]">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                輸入姓名，尋找被遺忘的遺產
              </h2>
              <p className="text-zinc-400 font-mono">探索台北市、新北市、彰化縣、嘉義市未繼承土地資料庫</p>
            </div>

            <HunterSearch onSearch={handleSearch} />

            {/* Error Display */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <span className="px-4 py-2 min-h-11 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-sm font-mono">
                <Zap className="w-4 h-4" />
                即時搜尋
              </span>
              <span className="px-4 py-2 min-h-11 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-mono">
                <Map className="w-4 h-4" />
                地圖視覺化
              </span>
              <button onClick={() => setShowModal(true)} className="px-4 py-2 min-h-11 flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-mono hover:bg-purple-500/20 transition-colors">
                <BookOpen className="w-4 h-4" />
                如何申請繼承？
              </button>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="max-w-6xl mx-auto flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="ml-3 text-zinc-400 font-mono">搜尋中...</span>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !loading && (
          <section className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <h3 className="text-xl font-bold text-amber-400 font-mono whitespace-nowrap">
                  搜尋結果 ({total} 筆)
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                aria-label={showMap ? '切換到列表模式' : '切換到地圖模式'}
                className="ml-4 px-4 py-2 min-h-11 flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-sm font-mono hover:bg-amber-500/30 transition-colors whitespace-nowrap"
              >
                {showMap ? (
                  <>
                    <List className="w-4 h-4" />
                    列表模式
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4" />
                    地圖模式
                  </>
                )}
              </button>
            </div>

            {showMap ? (
              <TreasureMap lands={results} />
            ) : (
              <BountyList lands={results} />
            )}
          </section>
        )}

        {/* Info Cards (when no search) */}
        {!hasSearched && !loading && (
          <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              { Icon: Map, title: '什麼是未繼承土地？', desc: '土地所有權人過世後，未辦理繼承登記的土地。可能蘊藏著被遺忘的家族財富。' },
              { Icon: Search, title: '如何使用尋寶網？', desc: '輸入姓名進行搜尋，系統會顯示相關的未繼承土地資料，包括地段、面積等資訊。' },
              { Icon: Scale, title: '發現遺產怎麼辦？', desc: '建議諮詢專業地政士或律師，確認繼承關係後，依法辦理繼承登記手續。' },
            ].map((card, i) => (
              <div key={i} className="group cursor-pointer bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)] hover:-translate-y-1">
                <card.Icon className="w-10 h-10 mb-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-amber-400 transition-colors">{card.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </section>
        )}

        {/* Footer Stats */}
        <footer className="mt-20 text-center">
          <div className="inline-flex gap-8 px-8 py-4 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-full">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {stats?.totalLands || '---'}
              </div>
              <div className="text-xs text-zinc-500">筆資料</div>
            </div>
            <div className="w-px bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {stats?.byCity?.length || 4}
              </div>
              <div className="text-xs text-zinc-500">個城市覆蓋</div>
            </div>
            <div className="w-px bg-zinc-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 font-mono">100%</div>
              <div className="text-xs text-zinc-500">免費查詢</div>
            </div>
          </div>
        </footer>
      </main>

      <HowToClaimModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
