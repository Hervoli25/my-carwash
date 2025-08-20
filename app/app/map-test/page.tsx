'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { DynamicMap } from '@/components/ui/dynamic-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/use-language';

export default function MapTestPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Leaflet Map Integration Test
            </h1>
            <p className="text-lg text-gray-600">
              Testing the Leaflet map component with localization
            </p>
          </div>

          <div className="space-y-8">
            {/* Map Component Test */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicMap 
                  height="400px" 
                  className="rounded-lg overflow-hidden"
                  showControls={true}
                />
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('footer.location.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>Address:</strong> {t('footer.location.address')}
                  </div>
                  <div>
                    <strong>Phone:</strong> {t('footer.location.phone')}
                  </div>
                  <div>
                    <strong>Email:</strong> {t('footer.location.email')}
                  </div>
                  <div>
                    <strong>Hours:</strong> {t('footer.location.hours')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
