import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary, AdvancedMarker } from '@vis.gl/react-google-maps';

export type LocationType = string | google.maps.LatLngLiteral;

function RouteDisplay({ origin, destination, waypoints, onRouteCalculated }: {
  origin: LocationType;
  destination: LocationType;
  waypoints?: LocationType[];
  onRouteCalculated?: (info: { distance: number, duration: string, durationValue?: number }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const geocodingLib = useMapsLibrary('geocoding');
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (!map) return;

    if (origin === destination) {
      // Clear route if it exists
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      
      if (typeof origin === 'string' && geocodingLib) {
        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ address: origin }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const pos = { lat: loc.lat(), lng: loc.lng() };
            setMarkerPosition(pos);
            map.setCenter(pos);
            map.setZoom(14);
          }
        });
      } else if (typeof origin !== 'string') {
        setMarkerPosition(origin as google.maps.LatLngLiteral);
        map.setCenter(origin as google.maps.LatLngLiteral);
        map.setZoom(14);
      }
      return;
    }

    // Normal routing
    setMarkerPosition(null);
    if (!routesLib) return;
    
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new routesLib.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#EAB308',
          strokeWeight: 4,
        }
      });
    }

    const directionsService = new routesLib.DirectionsService();

    const formattedWaypoints = waypoints?.map(wp => ({
      location: wp,
      stopover: true,
    })) || [];

    directionsService.route({
      origin,
      destination,
      waypoints: formattedWaypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then((response) => {
      directionsRendererRef.current?.setDirections(response);
      
      let totalMeters = 0;
      let totalSeconds = 0;
      response.routes[0].legs.forEach(leg => {
        totalMeters += leg.distance?.value || 0;
        totalSeconds += leg.duration?.value || 0;
      });
      
      if (onRouteCalculated) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const durationStr = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
        onRouteCalculated({ distance: totalMeters / 1000, duration: durationStr, durationValue: totalSeconds });
      }
      
    }).catch((e) => {
      console.error('Directions request failed due to ', e);
    });

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [routesLib, geocodingLib, map, origin, destination, waypoints, onRouteCalculated]);

  return markerPosition ? <AdvancedMarker position={markerPosition} /> : null;
}

export const getApiKey = () => {
  const localKey = typeof window !== 'undefined'
    ? localStorage.getItem('googleMapsApiKey') || ''
    : '';

  return localKey ||
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
};

export const hasValidKey = () => {
  const key = getApiKey();
  return Boolean(key) && key !== 'YOUR_API_KEY';
};

export default function BookingMap({ origin, destination, waypoints, onRouteCalculated }: {
  origin: LocationType;
  destination: LocationType;
  waypoints?: LocationType[];
  onRouteCalculated?: (info: { distance: number, duration: string, durationValue?: number }) => void;
}) {

  if (!hasValidKey()) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-100 rounded-xl flex-col p-6 text-center border border-zinc-200">
          <h3 className="text-zinc-900 font-bold mb-2">Google Maps API Key Required</h3>
          <p className="text-zinc-500 text-sm mb-4">To view the dynamic route map with multi-city stops, please add your Google Maps Platform Key.</p>
          <div className="text-left text-xs bg-white p-4 rounded-lg border border-zinc-200 text-zinc-600">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open <strong>Settings</strong> (⚙️)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Add secret: <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
            </ol>
          </div>
      </div>
    );
  }

  // default center somewhere in Europe
  const defaultCenter = typeof origin === 'string' ? { lat: 52.3676, lng: 4.9041 } : origin;

  return (
    <>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={7}
        mapId="BOOKING_ROUTE_MAP"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden"
      >
        <RouteDisplay origin={origin} destination={destination} waypoints={waypoints} onRouteCalculated={onRouteCalculated} />
      </Map>
    </>
  );
}
