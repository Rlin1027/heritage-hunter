'use client';

import { useState, useEffect } from 'react';
import { useCities } from '@/lib/hooks';
import type { SearchFilters } from '@/lib/types';

interface HunterSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

// Display names for cities
const CITY_DISPLAY_NAMES: Record<string, string> = {
  '台北市': '台北市',
  '新北市': '新北市',
  'Taipei': '台北市',
  'NewTaipei': '新北市',
  '彰化縣': '彰化縣',
  'Changhua': '彰化縣',
  '嘉義市': '嘉義市',
  '嘉義縣': '嘉義縣',
  'Chiayi': '嘉義',
};

export default function HunterSearch({ onSearch }: HunterSearchProps) {
  const { cities: availableCities } = useCities();
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');

  // Get unique city names
  const cityOptions = availableCities.length > 0
    ? availableCities.map(c => c.city)
    : ['台北市', '新北市', '彰化縣', '嘉義市']; // Fallback

  // Get districts for selected city
  const districtOptions = selectedCity
    ? availableCities.find(c => c.city === selectedCity)?.districts || []
    : [];

  const handleSearch = () => {
    onSearch({
      query: query.trim() || undefined,
      city: selectedCity,
      district: district || undefined,
    });
  };

  const handleReset = () => {
    setSelectedCity(undefined);
    setDistrict('');
    setQuery('');
    onSearch({});
  };

  // Reset district when city changes
  useEffect(() => {
    setDistrict('');
  }, [selectedCity]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Cyberpunk glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-cyan-500 rounded-2xl opacity-20 blur-xl" />

      <div className="relative bg-zinc-900/80 border-2 border-amber-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="space-y-4">
          {/* Search Query Input */}
          <div>
            <label htmlFor="query-input" className="block text-sm font-semibold text-zinc-300 mb-2 tracking-wide">
              姓名搜尋
            </label>
            <input
              id="query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="輸入被繼承人姓名..."
              className="
                w-full px-4 py-3 rounded-lg
                bg-zinc-800/50 text-zinc-100
                border-2 border-zinc-700
                focus:border-amber-500 focus:outline-none
                focus:shadow-[0_0_20px_rgba(251,191,36,0.2)]
                transition-all duration-200
                placeholder:text-zinc-500
                font-mono
              "
            />
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2 tracking-wide">
              選擇城市
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cityOptions.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(selectedCity === city ? undefined : city)}
                  className={`
                    relative px-4 py-3 min-h-11 rounded-lg font-medium transition-all duration-200
                    border-2 hover:scale-105 active:scale-95
                    ${selectedCity === city
                      ? 'bg-amber-500 text-zinc-900 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : 'bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:border-amber-500/50'
                    }
                    font-mono text-sm
                  `}
                >
                  <span className="relative z-10">
                    {CITY_DISPLAY_NAMES[city] || city}
                  </span>
                  {selectedCity === city && (
                    <div className="absolute inset-0 bg-amber-500 opacity-20 rounded-lg animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* District Selection (shows when city is selected) */}
          {selectedCity && districtOptions.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="district-select" className="block text-sm font-semibold text-zinc-300 mb-2 tracking-wide">
                選擇區域
              </label>
              <select
                id="district-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-zinc-800/50 text-zinc-100
                  border-2 border-zinc-700
                  focus:border-amber-500 focus:outline-none
                  transition-all duration-200
                  font-mono
                "
              >
                <option value="">全部區域</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSearch}
              className="
                flex-1 px-6 py-3 min-h-11 rounded-lg font-bold
                bg-amber-500 text-zinc-900
                border-2 border-amber-500
                hover:bg-transparent hover:text-amber-500
                shadow-[0_0_20px_rgba(251,191,36,0.3)]
                transition-all duration-200
                hover:scale-105 active:scale-95
                font-mono tracking-wider
              "
            >
              搜尋土地
            </button>

            <button
              onClick={handleReset}
              className="
                px-6 py-3 min-h-11 min-w-11 rounded-lg font-semibold
                bg-transparent text-zinc-400
                border-2 border-zinc-700
                hover:border-cyan-500 hover:text-cyan-400
                transition-all duration-200
                hover:scale-105 active:scale-95
                font-mono
              "
            >
              清除
            </button>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/30" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/30" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/30" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/30" />
      </div>
    </div>
  );
}
