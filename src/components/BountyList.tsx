'use client';

import { UnclaimedLand } from '@/lib/types';
import BountyCard from './BountyCard';

interface BountyListProps {
  lands: UnclaimedLand[];
  isLoading?: boolean;
  onLandClick?: (land: UnclaimedLand) => void;
}

export default function BountyList({ lands, isLoading, onLandClick }: BountyListProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            {/* Cyberpunk loading spinner */}
            <div className="[html[data-theme='cyberpunk']_&]:block [html[data-theme='indiana']_&]:hidden">
              <div className="absolute inset-0 border-4 border-[var(--color-border)] rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-transparent border-t-[var(--color-accent)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>

            {/* Indiana loading animation */}
            <div className="[html[data-theme='indiana']_&]:block [html[data-theme='cyberpunk']_&]:hidden">
              <svg className="w-16 h-16 animate-[bounce_1s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
                <path d="M30 50 Q50 20 70 50 T70 80" stroke="var(--color-primary)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="30" cy="50" r="6" fill="var(--color-accent)" className="animate-pulse" />
              </svg>
            </div>
          </div>

          <p className="text-[var(--color-text-dim)] font-medium [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)] [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:tracking-widest [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)] [html[data-theme='indiana']_&]:italic">
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              Scanning database...
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden">
              Consulting the ancient maps...
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (lands.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12">
        <div className="relative bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-2xl p-12 text-center">
          {/* Empty state illustration - Cyberpunk */}
          <div className="[html[data-theme='cyberpunk']_&]:block [html[data-theme='indiana']_&]:hidden mb-6">
            <svg className="w-24 h-24 mx-auto opacity-30" viewBox="0 0 100 100" fill="none">
              <rect x="20" y="20" width="60" height="60" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="30" y1="40" x2="70" y2="40" stroke="var(--color-text-dim)" strokeWidth="2" />
              <line x1="30" y1="50" x2="70" y2="50" stroke="var(--color-text-dim)" strokeWidth="2" />
              <line x1="30" y1="60" x2="70" y2="60" stroke="var(--color-text-dim)" strokeWidth="2" />
              <line x1="20" y1="20" x2="80" y2="80" stroke="var(--color-accent)" strokeWidth="3" />
            </svg>
          </div>

          {/* Empty state illustration - Indiana */}
          <div className="[html[data-theme='indiana']_&]:block [html[data-theme='cyberpunk']_&]:hidden mb-6">
            <svg className="w-24 h-24 mx-auto opacity-30" viewBox="0 0 100 100" fill="none">
              <path d="M50 20 L50 80 M30 50 L70 50" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="50" r="25" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M45 40 L50 50 L55 40" fill="var(--color-accent)" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-display)] [html[data-theme='cyberpunk']_&]:uppercase [html[data-theme='cyberpunk']_&]:tracking-wider [html[data-theme='indiana']_&]:font-[var(--font-indiana-display)]">
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              No Data Found
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden">
              The Trail Goes Cold
            </span>
          </h3>

          <p className="text-[var(--color-text-dim)] max-w-md mx-auto [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)] [html[data-theme='indiana']_&]:italic">
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              No unclaimed land matches your search parameters. Try adjusting your filters or reset to see all available bounties.
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden">
              No heritage sites match your quest parameters. Perhaps broaden your search, or the treasure lies elsewhere...
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Results header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-display)] [html[data-theme='cyberpunk']_&]:tracking-wide [html[data-theme='indiana']_&]:font-[var(--font-indiana-display)]">
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden [html[data-theme='cyberpunk']_&]:uppercase">
              Available Bounties
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden">
              Discovered Treasures
            </span>
          </h2>
          <p className="text-sm text-[var(--color-text-dim)] mt-1 [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)]">
            <span className="font-semibold text-[var(--color-primary)]">{lands.length}</span>
            {' '}
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              targets located
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)]">
              sites awaiting exploration
            </span>
          </p>
        </div>

        {/* View toggle or additional controls could go here */}
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lands.map((land) => (
          <BountyCard
            key={land.id}
            land={land}
            onClick={() => onLandClick?.(land)}
          />
        ))}
      </div>

      {/* Pagination hint */}
      {lands.length >= 20 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--color-text-dim)] [html[data-theme='cyberpunk']_&]:font-[var(--font-cyber-mono)] [html[data-theme='cyberpunk']_&]:uppercase">
            <span className="[html[data-theme='cyberpunk']_&]:inline [html[data-theme='indiana']_&]:hidden">
              More data available - refine search for better results
            </span>
            <span className="[html[data-theme='indiana']_&]:inline [html[data-theme='cyberpunk']_&]:hidden [html[data-theme='indiana']_&]:font-[var(--font-indiana-body)] [html[data-theme='indiana']_&]:italic">
              Many more treasures await discovery...
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
