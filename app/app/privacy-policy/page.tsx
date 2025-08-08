import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is our priority. Learn how we protect and handle your data.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                car wash services, website, and mobile application.
              </p>
              <p>
                We comply with the General Data Protection Regulation (GDPR) and South Africa's Protection of Personal
                Information Act (POPIA) to ensure your data rights are respected.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Vehicle information (make, model, license plate)</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Service preferences and history</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage data and analytics</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Service Data</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Photos of your vehicle (before/after service)</li>
                    <li>Service completion records</li>
                    <li>Quality assurance data</li>
                    <li>Customer feedback and ratings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Service Delivery</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Process bookings and payments</li>
                    <li>• Provide real-time service tracking</li>
                    <li>• Send service notifications</li>
                    <li>• Maintain service history</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Communication</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Send booking confirmations</li>
                    <li>• Provide customer support</li>
                    <li>• Share promotional offers (with consent)</li>
                    <li>• Collect feedback</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Improvement</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Analyze service performance</li>
                    <li>• Improve our technology</li>
                    <li>• Develop new features</li>
                    <li>• Ensure quality standards</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Legal Compliance</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Meet regulatory requirements</li>
                    <li>• Prevent fraud and abuse</li>
                    <li>• Resolve disputes</li>
                    <li>• Protect our rights</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-red-600" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Limited access on a need-to-know basis</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Staff Training:</strong> Regular privacy and security training for all employees</li>
                <li><strong>Secure Payments:</strong> PCI DSS compliant payment processing through Stripe</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                Your Data Rights (GDPR & POPIA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">GDPR Rights</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Right to access your data</li>
                    <li>• Right to rectification</li>
                    <li>• Right to erasure ("right to be forgotten")</li>
                    <li>• Right to restrict processing</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">POPIA Rights</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Right to be notified of data collection</li>
                    <li>• Right to access personal information</li>
                    <li>• Right to correction or deletion</li>
                    <li>• Right to object to processing</li>
                    <li>• Right to submit complaints</li>
                    <li>• Right to be informed of data breaches</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Exercise Your Rights:</strong> Contact our Data Protection Officer at
                  <a href="mailto:privacy@prestigecarwash.co.za" className="underline ml-1">
                    privacy@prestigecarwash.co.za
                  </a> to exercise any of these rights.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p><strong>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING</strong></p>
                <p>30 Lower Piers Road, Wynberg, Cape Town</p>
                <p>Phone: +27 78 613 2969</p>
                <p>Email: info@prestigecarwash.co.za</p>
                <p>Data Protection Officer: privacy@prestigecarwash.co.za</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
