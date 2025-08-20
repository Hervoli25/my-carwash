'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/use-language';
import { languages } from '@/lib/i18n/languages';

export default function LanguageDemoPage() {
  const { t, currentLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Multi-Language System Demo
            </h1>
            <p className="text-lg text-gray-600">
              Testing the internationalization system with South African languages + French
            </p>
            <Badge className="mt-4">
              Current Language: {languages[currentLanguage].nativeName} {languages[currentLanguage].flag}
            </Badge>
          </div>

          <div className="grid gap-6">
            {/* Navigation Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Translations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <strong>Home:</strong> {t('navigation.home')}
                  </div>
                  <div>
                    <strong>Services:</strong> {t('navigation.services')}
                  </div>
                  <div>
                    <strong>Book Now:</strong> {t('navigation.book')}
                  </div>
                  <div>
                    <strong>Profile:</strong> {t('navigation.profile')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Common Translations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <strong>Loading:</strong> {t('common.loading')}
                  </div>
                  <div>
                    <strong>Success:</strong> {t('common.success')}
                  </div>
                  <div>
                    <strong>Cancel:</strong> {t('common.cancel')}
                  </div>
                  <div>
                    <strong>Save:</strong> {t('common.save')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Home Page Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Home Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>Hero Title:</strong><br />
                    <span className="text-lg">{t('home.hero.title')}</span>
                  </div>
                  <div>
                    <strong>Hero Subtitle:</strong><br />
                    <span className="text-gray-600">{t('home.hero.subtitle')}</span>
                  </div>
                  <div>
                    <strong>Call to Action:</strong><br />
                    <span className="text-blue-600">{t('home.hero.cta')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Services Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>Express Service:</strong><br />
                    <span className="font-medium">{t('services.express.name')}</span><br />
                    <span className="text-sm text-gray-600">{t('services.express.description')}</span>
                  </div>
                  <div>
                    <strong>Premium Service:</strong><br />
                    <span className="font-medium">{t('services.premium.name')}</span><br />
                    <span className="text-sm text-gray-600">{t('services.premium.description')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Translations */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Sign In:</strong><br />
                    <span>{t('auth.signin.title')}</span><br />
                    <span className="text-sm text-gray-600">{t('auth.signin.subtitle')}</span>
                  </div>
                  <div>
                    <strong>Sign Up:</strong><br />
                    <span>{t('auth.signup.title')}</span><br />
                    <span className="text-sm text-gray-600">{t('auth.signup.subtitle')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Selector Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>1. Use the language selector in the top navigation (🌍 icon)</p>
                  <p>2. Switch between languages to see translations update</p>
                  <p>3. Language preference is saved in localStorage</p>
                  <p>4. For logged-in users, preference is also saved to database</p>
                  <p>5. Mobile users can access language selector in the mobile menu</p>
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
