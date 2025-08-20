'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/use-language';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  className?: string;
  height?: string;
  showControls?: boolean;
}

// Car wash location coordinates (Wynberg, Cape Town)
const CAR_WASH_LOCATION = {
  lat: -34.0055,
  lng: 18.4241,
  address: '30 Lower Piers Road, Wynberg, Cape Town'
};

// Custom marker icon
const createCustomIcon = () => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="#dc2626" stroke="white" stroke-width="2"/>
        <path d="M16 8L20 12H18V20H14V12H12L16 8Z" fill="white"/>
        <circle cx="16" cy="22" r="2" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export function LeafletMap({ className = '', height = '400px', showControls = true }: LeafletMapProps) {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Ensure Leaflet is loaded on client side
    const loadMap = async () => {
      try {
        // Fix for default markers in react-leaflet
        const L = await import('leaflet');
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading map:', err);
        setError(t('footer.location.mapError'));
      }
    };

    loadMap();
  }, [t]);

  const handleGetDirections = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${CAR_WASH_LOCATION.lat},${CAR_WASH_LOCATION.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleViewOnGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/place/${CAR_WASH_LOCATION.lat},${CAR_WASH_LOCATION.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleViewOnGoogleMaps} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('footer.location.viewOnMap')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('footer.location.mapLoading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-0">
        <div style={{ height }} className="relative">
          <MapContainer
            center={[CAR_WASH_LOCATION.lat, CAR_WASH_LOCATION.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker 
              position={[CAR_WASH_LOCATION.lat, CAR_WASH_LOCATION.lng]}
              icon={createCustomIcon()}
            >
              <Popup>
                <div className="text-center p-2">
                  <h3 className="font-semibold text-lg mb-2">PRESTIGE Car Wash</h3>
                  <p className="text-sm text-gray-600 mb-3">{CAR_WASH_LOCATION.address}</p>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      onClick={handleGetDirections}
                      className="w-full"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      {t('footer.location.getDirections')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleViewOnGoogleMaps}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('footer.location.viewOnMap')}
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        {showControls && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleGetDirections}
                className="flex-1"
                size="sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {t('footer.location.getDirections')}
              </Button>
              <Button 
                onClick={handleViewOnGoogleMaps}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('footer.location.viewOnMap')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
