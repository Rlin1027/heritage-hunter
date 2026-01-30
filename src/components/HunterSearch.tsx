'use client';

import { useState } from 'react';
import { SearchFilters, UnclaimedLand } from '@/lib/types';

interface HunterSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

const CITIES: UnclaimedLand['sourceCity'][] = ['Changhua', 'Chiayi', 'Taipei', 'NewTaipei'];

export default function HunterSearch({ onSearch }: HunterSearchProps) {
  const [selectedCity, setSelectedCity] = useState<UnclaimedLand['sourceCity'] | undefined>();
  const [district, setDistrict] = useState('');

  const handleSearch = () => {
    onSearch({
      city: selectedCity,
      district: district.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSelectedCity(undefined);
    setDistrict('');
    onSearch({});
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Cyberpunk glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-2xl opacity-20 blur-xl [.data-theme-cyberpunk_&]:opacity-30" />

      <div className="relative bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        {/* Header with theme-specific styling */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2 [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-display)] [html[data-theme='cyberpunk']_&]:tracking-wider [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='indiana']_&]:font-[var(--font-indiana-display)]">
            <span className="[html[data-theme='cyberpunk']_&]:glow-text">Hunt the Heritage</span>
            <span className="[html[data-theme='indiana']_&]:text-[var(--color-primary)]">Begin Your Quest</span>
          </h2>
          <p className="text-[var(--color-text-dim)] text-sm [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)] [html[data-theme='indiana']_&]:italic">
            {/* Cyberpunk text */}
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              Scan the grid. Filter by coordinates. Lock onto your target.
            </span>
            {/* Indiana text */}
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden">
              Every great discovery begins with knowing where to dig...
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2 [html[data-theme='cyberpunk']_&]:tracking-wide [html[data-theme='cyberpunk']_&]:uppercase">
              Target City
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`
                    relative px-4 py-3 min-h-11 rounded-lg font-medium transition-all duration-200
                    border-2 hover:scale-105 active:scale-95
                    ${selectedCity === city
                      ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)] shadow-[var(--glow-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                    }
                    [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)]
                    [html[data-theme='cyberpunk']_&]:text-xs
                    [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)]
                  `}
                >
                  <span className="relative z-10">{city}</span>
                  {selectedCity === city && (
                    <div className="absolute inset-0 bg-[var(--color-primary)] opacity-20 rounded-lg animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* District Input */}
          <div>
            <label htmlFor="district-input" className="block text-sm font-semibold text-[var(--color-text)] mb-2 [html[data-theme='cyberpunk']_&]:tracking-wide [html[data-theme='cyberpunk']_&]:uppercase">
              District / Sector
            </label>
            <input
              id="district-input"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Enter district name..."
              className="
                w-full px-4 py-3 rounded-lg
                bg-[var(--color-surface)] text-[var(--color-text)]
                border-2 border-[var(--color-border)]
                focus:border-[var(--color-primary)] focus:outline-none
                focus:shadow-[var(--glow-primary)]
                transition-all duration-200
                placeholder:text-[var(--color-text-dim)]
                [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)]
                [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)]
              "
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSearch}
              className="
                flex-1 px-6 py-3 min-h-11 rounded-lg font-bold
                bg-[var(--color-primary)] text-[var(--color-bg)]
                border-2 border-[var(--color-primary)]
                hover:bg-transparent hover:text-[var(--color-primary)]
                shadow-[var(--glow-primary)]
                transition-all duration-200
                hover:scale-105 active:scale-95
                [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-display)]
                [html[data-theme='cyberpunk']_&]:tracking-wider
                [html[data-theme='cyberpunk']_&]:uppercase
                [html[data-theme='indiana']_&]:font-[var(--font-indiana-display)]
              "
            >
              <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">Execute Search</span>
              <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden">Begin the Hunt</span>
            </button>

            <button
              onClick={handleReset}
              className="
                px-6 py-3 min-h-11 min-w-11 rounded-lg font-semibold
                bg-transparent text-[var(--color-text-dim)]
                border-2 border-[var(--color-border)]
                hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
                transition-all duration-200
                hover:scale-105 active:scale-95
                [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)]
              "
            >
              Reset
            </button>
          </div>
        </div>

        {/* Decorative corner elements - Cyberpunk */}
        <div className="[html[data-theme='cyberpunk']_&]:block [html[data-theme='indiana']_&]:hidden">
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--color-primary)] opacity-50" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--color-primary)] opacity-50" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--color-primary)] opacity-50" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--color-primary)] opacity-50" />
        </div>

        {/* Decorative elements - Indiana */}
        <div className="[html[data-theme='indiana']_&]:block [html[data-theme='cyberpunk']_&]:hidden">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-16 opacity-10">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M50 10 L90 90 L10 90 Z" fill="var(--color-accent)" />
              <circle cx="50" cy="50" r="15" fill="var(--color-primary)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
