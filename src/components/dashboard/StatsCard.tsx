'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20">
      {/* Cyberpunk glow effect */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-cyan-400/80">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
