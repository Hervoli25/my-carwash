'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/use-language';

// Dynamically import the LeafletMap component to avoid SSR issues
const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />
  }
);

function MapLoadingFallback() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('footer.location.mapLoading')}</p>
      </CardContent>
    </Card>
  );
}

interface DynamicMapProps {
  className?: string;
  height?: string;
  showControls?: boolean;
}

export function DynamicMap(props: DynamicMapProps) {
  return <LeafletMap {...props} />;
}
