'use client';

import { memo } from 'react';
import { UnclaimedLand } from '@/lib/types';

interface BountyCardProps {
  land: UnclaimedLand;
  onClick?: () => void;
}

function BountyCard({ land, onClick }: BountyCardProps) {
  const statusColors = {
    available: 'text-green-400',
    claimed: 'text-yellow-400',
    verified: 'text-blue-400',
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Hover glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />

      <div className="relative bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] border-2 border-[var(--color-border)] group-hover:border-[var(--color-primary)] rounded-xl p-5 transition-all duration-300 shadow-lg group-hover:shadow-[var(--glow-primary)] overflow-hidden">

        {/* Background pattern - Cyberpunk */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 [html[data-theme='cyberpunk']_&]:block [html[data-theme='indiana']_&]:hidden">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" stroke="var(--color-primary)" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" stroke="var(--color-accent)" strokeWidth="2" />
          </svg>
        </div>

        {/* Background decoration - Indiana */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 [html[data-theme='indiana']_&]:block [html[data-theme='cyberpunk']_&]:hidden">
          <svg viewBox="0 0 100 100" fill="var(--color-accent)">
            <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" />
          </svg>
        </div>

        {/* Header with location */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-[var(--color-primary)] text-[var(--color-bg)] [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)] [html[data-theme='cyberpunk']_&]:tracking-wider">
                {land.sourceCity}
              </span>
              <span className="text-sm text-[var(--color-text-dim)] [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)]">
                {land.district}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)] [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-display)] [html[data-theme='cyberpunk']_&]:tracking-wide [html[data-theme='indiana']_&]:font-[var(--font-indiana-display)]">
              {land.section}
            </h3>
          </div>

          {/* Status indicator */}
          <div className="flex flex-col items-end">
            <div className={`text-xs font-semibold ${statusColors[land.status as keyof typeof statusColors] || 'text-gray-400'} [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:tracking-widest`}>
              {land.status}
            </div>
            <div className="mt-1 w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse shadow-[var(--glow-primary)]" />
          </div>
        </div>

        {/* Land details grid */}
        <div className="space-y-3">
          {/* Land Number */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] border-opacity-30">
            <span className="text-sm text-[var(--color-text-dim)] [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:text-xs [html[data-theme='cyberpunk']_&]:tracking-wide">
              Land ID
            </span>
            <span className="font-mono text-sm font-semibold text-[var(--color-text)] [html[data-theme='cyberpunk']_&]:text-[var(--color-primary)]">
              {land.landNumber}
            </span>
          </div>

          {/* Owner */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] border-opacity-30">
            <span className="text-sm text-[var(--color-text-dim)] [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:text-xs [html[data-theme='cyberpunk']_&]:tracking-wide">
              Owner
            </span>
            <span className="text-sm font-medium text-[var(--color-text)] [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)]">
              {land.ownerName}
            </span>
          </div>

          {/* Area */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[var(--color-text-dim)] [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:text-xs [html[data-theme='cyberpunk']_&]:tracking-wide">
              Area
            </span>
            <div className="flex gap-3 items-baseline">
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {land.areaM2.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--color-text-dim)]">m²</span>
              <span className="text-sm text-[var(--color-text-dim)]">
                ({land.areaPing.toFixed(2)} 坪)
              </span>
            </div>
          </div>
        </div>

        {/* Call to action overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl pointer-events-none" />

        {/* Cyberpunk scan line effect */}
        <div className="[html[data-theme='cyberpunk']_&]:block [html[data-theme='indiana']_&]:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-40 group-hover:animate-[scan_1.5s_ease-in-out_infinite]" />
        </div>

        <style jsx>{`
          @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
          }
        `}</style>

        {/* Action hint */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] border-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs text-center text-[var(--color-text-dim)] [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)] [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:tracking-widest">
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              → Click to acquire data
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)] [html[data-theme='indiana']_&]:italic">
              Click to examine further →
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(BountyCard);
