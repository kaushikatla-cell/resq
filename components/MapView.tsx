'use client';
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { FoodBankRanked } from '@/types';

export function MapView({ donorLat, donorLng, banks, apiKey }: { donorLat: number; donorLng: number; banks: FoodBankRanked[]; apiKey: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    const loader = new Loader({ apiKey, version: 'weekly', libraries: ['maps','marker'] });
    loader.load().then(async (google) => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: donorLat, lng: donorLng }, zoom: 13,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
        styles: [{ featureType:'poi', elementType:'labels', stylers:[{ visibility:'off' }] }],
      });
      new google.maps.Marker({ position: { lat: donorLat, lng: donorLng }, map, title: 'Donor',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3B82F6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
      banks.forEach((bank, i) => {
        const marker = new google.maps.Marker({ position: { lat: bank.lat, lng: bank.lng }, map, title: bank.name,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: i === 0 ? 10 : 7, fillColor: i === 0 ? '#22C55E' : '#94A3B8', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
        const iw = new google.maps.InfoWindow({ content: `<div style="font-size:13px;padding:4px"><strong>${bank.name}</strong><br/>${bank.distance_miles.toFixed(1)} mi · Score: ${bank.score}</div>` });
        marker.addListener('click', () => iw.open(map, marker));
      });
      if (banks.length > 0) {
        const ds = new google.maps.DirectionsService();
        const dr = new google.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: { strokeColor: '#22C55E', strokeWeight: 3, strokeOpacity: 0.7 } });
        dr.setMap(map);
        ds.route({ origin: { lat: donorLat, lng: donorLng }, destination: { lat: banks[0].lat, lng: banks[0].lng }, travelMode: google.maps.TravelMode.DRIVING },
          (result, status) => { if (status === 'OK' && result) dr.setDirections(result); });
      }
    }).catch(err => console.error('Maps error:', err));
  }, [donorLat, donorLng, banks, apiKey]);

  if (!apiKey) return (
    <div className="h-56 bg-gray-50 flex items-center justify-center text-sm text-gray-400">
      <div className="text-center">
        <div className="text-2xl mb-2">🗺</div>
        <p>Map unavailable — set NEXT_PUBLIC_GOOGLE_MAPS_KEY</p>
        <div className="mt-3 text-xs space-y-1">
          {banks.map((b, i) => <p key={b.id}>{i+1}. {b.name} — {b.distance_miles.toFixed(1)} mi (score {b.score})</p>)}
        </div>
      </div>
    </div>
  );
  return <div ref={mapRef} className="w-full h-64" />;
}
