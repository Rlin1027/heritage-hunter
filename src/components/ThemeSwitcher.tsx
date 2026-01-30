'use client';

import { useThemeStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="group relative h-14 w-14 min-h-11 min-w-11 overflow-hidden rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Toggle theme"
    >
      {/* Cyberpunk Icon - Neon Circuit */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          theme === 'cyberpunk' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
        }`}
      >
        <div className="relative">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_8px_var(--color-primary)]">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="var(--color-primary)" className="animate-pulse" />
            <path d="M12 9v6M9 12h6" stroke="var(--color-bg)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 bg-[var(--color-primary)] opacity-20 blur-xl" />
        </div>
      </div>

      {/* Indiana Jones Icon - Fedora & Whip */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          theme === 'indiana' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
        }`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          {/* Hat */}
          <path d="M6 10h12l-1-3H7l-1 3z" fill="var(--color-primary)" />
          <ellipse cx="12" cy="10" rx="7" ry="2" fill="var(--color-primary)" />
          <path d="M5 10c0 .5.5 1 1.5 1.5C8 12 10 12.5 12 12.5s4-.5 5.5-1c1-.5 1.5-1 1.5-1.5" stroke="var(--color-accent)" strokeWidth="0.5" />
          {/* Whip coil */}
          <path
            d="M14 13c.5.5 1 1.5 1.5 2.5s.8 2 1 3"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="origin-[14px_13px] group-hover:animate-[swing_0.6s_ease-in-out_infinite]"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
      `}</style>
    </button>
  );
}
