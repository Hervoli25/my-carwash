import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, AlertTriangle, CreditCard, Shield, Users } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Scale className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using our services.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          {/* Agreement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                By accessing and using the services provided by PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING
                ("Company," "we," "our," or "us"), you accept and agree to be bound by the terms and provision
                of this agreement.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our car wash services, website, mobile
                application, and any related services provided by us.
              </p>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Our Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Car Wash Services</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Express Wash - Basic exterior cleaning</li>
                    <li>Premium Wash & Wax - Comprehensive cleaning with protective wax</li>
                    <li>Deluxe Detail - Interior and exterior detailing</li>
                    <li>Executive Package - Premium full-service treatment</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Technology Features</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Real-time service tracking with photo updates</li>
                    <li>AI-powered damage detection and quality assurance</li>
                    <li>Weather-based smart scheduling</li>
                    <li>Gamification and rewards system</li>
                    <li>Voice assistant for hands-free booking</li>
                    <li>Environmental impact tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vehicle Preparation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Remove all personal items from your vehicle</li>
                    <li>• Ensure windows are closed and doors are unlocked</li>
                    <li>• Inform us of any vehicle damage or special requirements</li>
                    <li>• Provide accurate license plate information</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Account Usage</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Provide accurate and current information</li>
                    <li>• Maintain the security of your account credentials</li>
                    <li>• Use services only for lawful purposes</li>
                    <li>• Respect our staff and other customers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Payment Processing</h4>
                  <p className="text-gray-700">
                    All payments are processed securely through Stripe. We accept major credit cards,
                    debit cards, and digital payment methods. Payment is required at the time of booking
                    or service completion.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Pricing</h4>
                  <p className="text-gray-700">
                    Prices are subject to change without notice. Current pricing is available on our
                    website and mobile app. Dynamic pricing may apply based on weather conditions,
                    demand, and other factors.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Refunds</h4>
                  <p className="text-gray-700">
                    Refunds are available for cancelled services (minimum 2 hours notice required)
                    or unsatisfactory service quality. Refund requests must be made within 24 hours
                    of service completion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Liability and Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Service Limitations</h4>
                  <p className="text-gray-700">
                    While we strive to provide excellent service, we cannot guarantee specific results.
                    Some stains, damage, or wear may not be removable through standard car wash processes.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Vehicle Damage</h4>
                  <p className="text-gray-700">
                    We are not liable for pre-existing damage, wear, or defects. Our AI damage detection
                    system documents vehicle condition before service. Any damage caused by our negligence
                    will be addressed according to our insurance policy.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Personal Property</h4>
                  <p className="text-gray-700">
                    We are not responsible for personal items left in vehicles. Please remove all
                    valuables, documents, and personal belongings before service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Technology and Data Usage</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Photo Documentation</h4>
                  <p className="text-gray-700">
                    We take before and after photos of your vehicle for quality assurance and tracking
                    purposes. These photos are stored securely and used only for service delivery and
                    improvement.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">AI and Automation</h4>
                  <p className="text-gray-700">
                    Our AI systems assist with damage detection, quality control, and service optimization.
                    While highly accurate, AI assessments may not catch all issues and should not be
                    considered definitive.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Data Collection</h4>
                  <p className="text-gray-700">
                    We collect and process data as outlined in our Privacy Policy. This includes service
                    data, vehicle information, and usage analytics to improve our services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p><strong>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING</strong></p>
                <p>1 Piers Road, Cape Town, Western Cape, 7800, South Africa</p>
                <p>Phone: +27 78 613 2969</p>
                <p>Email: info@prestigecarwash.co.za</p>
                <p>Legal inquiries: legal@prestigecarwash.co.za</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
