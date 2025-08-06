
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="relative h-10 w-32">
                <Image
                  src="/ekhaya-logo.jpg"
                  alt="Ekhaya Intel Trading"
                  fill
                  className="object-contain filter brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Premium car wash services in Cape Town with productive customer lounge experience. 
              Where waiting becomes productive.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Cape Town, Western Cape</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+27 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@ekhayaintel.co.za</span>
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
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Ekhaya Intel Trading. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
