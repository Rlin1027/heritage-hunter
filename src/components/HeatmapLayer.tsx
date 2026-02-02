import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { UnclaimedLand } from '@/lib/types';

interface HeatmapLayerProps {
  lands: UnclaimedLand[];
}

export function HeatmapLayer({ lands }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    // Extract valid coordinates with weights
    const heatPoints: [number, number, number][] = lands
      .filter((land) => land.coordinates)
      .map((land) => [
        land.coordinates!.lat,
        land.coordinates!.lng,
        // Normalize area to reasonable weight (1-10 scale)
        Math.min(10, Math.max(1, land.areaM2 / 100)),
      ]);

    // Skip if no valid points
    if (heatPoints.length === 0) return;

    // Create heat layer
    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: 'green',
        0.6: 'yellow',
        1: 'red',
      },
    }).addTo(map);

    // Cleanup on unmount or when lands change
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, lands]);

  return null;
}
