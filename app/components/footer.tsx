'use client';


import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  QrCode,
  Gift,
  Download,
  Share2,
  Map,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkingQR } from '@/components/qr-code/working-qr';
import { AnimatedLogo } from '@/components/animations/animated-logo';
import { useLanguage } from '@/lib/i18n/use-language';
import { DynamicMap } from '@/components/ui/dynamic-map';
import { useState } from 'react';

export function Footer() {
  const { t } = useLanguage();
  const [showMap, setShowMap] = useState(false);
  const currentYear = new Date().getFullYear();
  const baseOrigin = (process.env.NEXT_PUBLIC_SITE_URL as string) || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const registrationUrl = `${baseOrigin}/auth/signup?ref=qr`;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <AnimatedLogo
                size="large"
                variant="footer"
                className="transition-all duration-300 hover:scale-105"
                enableEntrance={true}
                enableHover={true}
              />
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
             
              </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4 mb-6">
              <Link href="https://facebook.com/prestigecarwash" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="https://instagram.com/prestigecarwash" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 transition-colors duration-300 transform hover:scale-110">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="https://twitter.com/prestigecarwash" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400 transition-colors duration-300 transform hover:scale-110">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href="https://youtube.com/prestigecarwash" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 transition-colors duration-300 transform hover:scale-110">
                <Youtube className="w-6 h-6" />
              </Link>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">{t('footer.location.title')}</h4>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t('footer.location.address')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{t('footer.location.phone')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{t('footer.location.email')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('footer.location.hours')}</span>
                </div>
              </div>

              {/* Map Toggle Button */}
              <Button
                onClick={() => setShowMap(!showMap)}
                variant="outline"
                size="sm"
                className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {showMap ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    {t('footer.location.hideMap')}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {t('footer.location.showMap')}
                  </>
                )}
              </Button>

              {/* Interactive Map */}
              {showMap && (
                <div className="mt-4">
                  <DynamicMap
                    height="300px"
                    className="rounded-lg overflow-hidden"
                    showControls={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('navigation.home') === 'Home' ? 'Quick Links' : t('footer.company')}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  {t('navigation.services')}
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  {t('navigation.book')}
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-white transition-colors">
                  {t('navigation.membership')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/services/express" className="hover:text-white transition-colors">
                  {t('footer.links.expressWash')}
                </Link>
              </li>
              <li>
                <Link href="/services/premium" className="hover:text-white transition-colors">
                  {t('footer.links.premiumWash')}
                </Link>
              </li>
              <li>
                <Link href="/services/deluxe" className="hover:text-white transition-colors">
                  {t('footer.links.detailing')}
                </Link>
              </li>
              <li>
                <Link href="/services/executive" className="hover:text-white transition-colors">
                  {t('services.executive.name')}
                </Link>
              </li>
            </ul>
          </div>

          {/* QR Registration */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Quick Register
            </h3>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center mb-2">
                  <Badge className="bg-blue-500 text-white px-2 py-1 text-xs">
                    <Gift className="w-3 h-3 mr-1" />
                    Quick Access
                  </Badge>
                </div>
                <CardTitle className="text-sm text-white text-center">
                  Quick Register
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Functional QR Code */}
                <div id="footer-qr-container" className="flex justify-center bg-white p-3 rounded-lg shadow-inner">
                  <WorkingQR
                    value={registrationUrl}
                    size={120}
                    className="mx-auto"
                  />
                </div>

                {/* Instructions */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-300">Scan to register quickly</p>
                  <p className="text-xs text-yellow-400">Create your account in seconds</p>
                </div>

                {/* Actions: Download / Share */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs px-2 py-1 h-8 min-w-0 flex-1"
                    onClick={async () => {
                      const container = document.querySelector('#footer-qr-container');
                      const canvas = container?.querySelector('canvas') as HTMLCanvasElement | null;
                      if (!canvas) return;
                      
                      // Create a larger canvas with descriptive text and pricing
                      const printCanvas = document.createElement('canvas');
                      const ctx = printCanvas.getContext('2d');
                      if (!ctx) return;
                      
                      // Set canvas size for print version
                      printCanvas.width = 400;
                      printCanvas.height = 520;
                      
                      // Fill background
                      ctx.fillStyle = '#ffffff';
                      ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);
                      
                      // Add header text
                      ctx.fillStyle = '#1f2937';
                      ctx.font = 'bold 24px Arial';
                      ctx.textAlign = 'center';
                      ctx.fillText('PRESTIGE Car Wash', 200, 40);
                      
                      ctx.font = 'bold 18px Arial';
                      ctx.fillStyle = '#3b82f6';
                      ctx.fillText('Quick Registration', 200, 65);
                      
                      // Add QR code
                      const qrSize = 200;
                      const qrX = (printCanvas.width - qrSize) / 2;
                      const qrY = 80;
                      ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);
                      
                      // Add pricing information
                      ctx.fillStyle = '#1f2937';
                      ctx.font = 'bold 16px Arial';
                      ctx.fillText('Our Services & Pricing', 200, 320);
                      
                      ctx.font = '14px Arial';
                      const services = [
                        'Express Wash - R80',
                        'Premium Wash & Wax - R120',
                        'Deluxe Detail - R180',
                        'Executive Package - R250'
                      ];
                      
                      services.forEach((service, index) => {
                        ctx.fillText(service, 200, 345 + (index * 20));
                      });
                      
                      // Add call to action
                      ctx.fillStyle = '#16a34a';
                      ctx.font = 'bold 16px Arial';
                      ctx.fillText('Scan to Register & Get 10% Off!', 200, 450);
                      
                      // Add contact info
                      ctx.fillStyle = '#6b7280';
                      ctx.font = '12px Arial';
                      ctx.fillText('30 Lower Piers Road, Wynberg, Cape Town', 200, 475);
                      ctx.fillText('+27 78 613 2969', 200, 495);
                      ctx.fillText('Mon-Fri: 8AM-6PM, Sat: 8AM-5PM, Sun: 9AM-2PM', 200, 510);
                      
                      // Download the enhanced QR code
                      const link = document.createElement('a');
                      link.href = printCanvas.toDataURL('image/png');
                      link.download = 'prestige-carwash-registration-qr.png';
                      link.click();
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-8 min-w-0 flex-1"
                    onClick={async () => {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        try {
                          await navigator.share({
                            title: 'PRESTIGE Car Wash - Quick Registration',
                            text: 'Scan this QR code to register for PRESTIGE Car Wash and get 10% off your first service! Services from R80. Located at 30 Lower Piers Road, Wynberg, Cape Town.',
                            url: registrationUrl
                          });
                          return;
                        } catch (e) {
                          // fall through to fallback
                        }
                      }
                      
                      // Fallback: copy URL to clipboard
                      try {
                        await navigator.clipboard.writeText(
                          `Register for PRESTIGE Car Wash and get 10% off! Services from R80.\n${registrationUrl}`
                        );
                        alert('Registration link copied to clipboard!');
                      } catch (e) {
                        window.open(registrationUrl, '_blank');
                      }
                    }}
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>

                {/* Link for manual access */}
                <div className="text-center">
                  <Link
                    href="/auth/signup?ref=qr"
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Or register online
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legal & Privacy Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Compliance Info */}
            <div className="text-sm text-gray-300">
              <h4 className="font-medium text-white mb-2">Data Protection & Compliance</h4>
              <p className="mb-2">
                We are committed to protecting your privacy and comply with GDPR and South Africa's POPIA regulations.
              </p>
              <p>
                License plate information is mandatory for vehicle tracking and service delivery.
              </p>
            </div>

            {/* Legal Links */}
            <div className="text-sm">
              <h4 className="font-medium text-white mb-2">Legal Information</h4>
              <div className="flex flex-wrap gap-4">
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
                <Link href="/legal-disclaimer" className="text-gray-300 hover:text-white transition-colors">
                  Legal Disclaimer
                </Link>
              </div>
              <div className="mt-2">
                <span className="text-gray-400">Data Protection Officer:</span>
                <a href="mailto:privacy@prestigecarwash.co.za" className="text-gray-300 hover:text-white transition-colors ml-1">
                  privacy@prestigecarwash.co.za
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright').replace('2024', currentYear.toString())} | GDPR & POPIA Compliant
          </p>
        </div>
      </div>
    </footer>
  );
}
