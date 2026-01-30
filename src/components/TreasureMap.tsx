'use client';

import dynamic from 'next/dynamic';
import type { UnclaimedLand } from '@/lib/types';

interface TreasureMapProps {
  lands: UnclaimedLand[];
  onMarkerClick?: (land: UnclaimedLand) => void;
}

const MapWithNoSSR = dynamic(
  () => import('./MapContent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-zinc-400 font-mono">載入地圖中...</p>
        </div>
      </div>
    )
  }
);

export default function TreasureMap({ lands, onMarkerClick }: TreasureMapProps) {
  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-amber-500/30 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
      <MapWithNoSSR lands={lands} onMarkerClick={onMarkerClick} />
    </div>
  );
}
