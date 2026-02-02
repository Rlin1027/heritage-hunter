'use client';

interface MapLegendProps {
  visible: boolean;
}

export function MapLegend({ visible }: MapLegendProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-6 right-6 z-[1000] bg-zinc-900/90 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 shadow-xl">
      <h3 className="text-amber-400 font-bold text-sm mb-3 tracking-wide">
        Heatmap Legend
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'red' }} />
          <span className="text-white text-sm">High Density</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'yellow' }} />
          <span className="text-white text-sm">Medium Density</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: 'green' }} />
          <span className="text-white text-sm">Low Density</span>
        </div>
      </div>
    </div>
  );
}
