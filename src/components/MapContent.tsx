'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UnclaimedLand } from '@/lib/types';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom treasure icon
const treasureIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700" width="32" height="32">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapContentProps {
  lands: UnclaimedLand[];
  onMarkerClick?: (land: UnclaimedLand) => void;
}

export default function MapContent({ lands, onMarkerClick }: MapContentProps) {
  return (
    <MapContainer
      center={[25.0330, 121.5654]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {lands.filter(land => land.coordinates).map((land) => (
        <Marker
          key={land.id}
          position={[land.coordinates!.lat, land.coordinates!.lng]}
          icon={treasureIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(land),
          }}
        >
          <Popup>
            <div className="p-3 min-w-[220px] bg-zinc-900 text-white rounded-lg">
              <h3 className="font-bold text-amber-400 text-lg mb-2 flex items-center gap-2">
                <span>💎</span> {land.ownerName}
              </h3>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-zinc-400">地區:</span> {land.district}</p>
                <p><span className="text-zinc-400">地段:</span> {land.section}</p>
                <p><span className="text-zinc-400">地號:</span> {land.landNumber}</p>
                <p><span className="text-zinc-400">面積:</span> {land.areaM2.toLocaleString()} m² ({land.areaPing.toFixed(2)} 坪)</p>
                <p><span className="text-zinc-400">狀態:</span> <span className="text-amber-300">{land.status}</span></p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
