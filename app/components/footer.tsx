
import Image from 'next/image';
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
  Gift
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkingQR } from '@/components/qr-code/working-qr';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="relative h-16 w-64">
                <Image
                  src="/logocarwash.jpg"
                  alt="PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING"
                  fill
                  className="object-contain filter brightness-110 contrast-125"
                />
              </div>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Premium car wash services in Cape Town with productive customer lounge experience. 
              Where waiting becomes productive.
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

            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>30 Lower Piers Road, Wynberg, Cape Town</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+27 78 613 2969</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@prestigecarwash.co.za</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Mon-Sat: 8AM-6PM, Sun: 9AM-4PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  Book Online
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/services/express" className="hover:text-white transition-colors">
                  Express Wash
                </Link>
              </li>
              <li>
                <Link href="/services/premium" className="hover:text-white transition-colors">
                  Premium Wash & Wax
                </Link>
              </li>
              <li>
                <Link href="/services/deluxe" className="hover:text-white transition-colors">
                  Deluxe Detail
                </Link>
              </li>
              <li>
                <Link href="/services/executive" className="hover:text-white transition-colors">
                  Executive Package
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
                  <Badge className="bg-yellow-500 text-black px-2 py-1 text-xs">
                    <Gift className="w-3 h-3 mr-1" />
                    VIP INVITATION
                  </Badge>
                </div>
                <CardTitle className="text-sm text-white text-center">
                  Quick Register
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Functional QR Code */}
                <div className="flex justify-center bg-white p-3 rounded-lg shadow-inner">
                  <WorkingQR 
                    value="http://localhost:3000/auth/signup?ref=qr"
                    size={120}
                    className="mx-auto"
                  />
                </div>

                {/* Instructions */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-300">Scan to register for VIP</p>
                  <p className="text-xs text-yellow-400">Get 10% off + rewards</p>
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
            © {currentYear} PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING. All rights reserved. | GDPR & POPIA Compliant
          </p>
        </div>
      </div>
    </footer>
  );
}
