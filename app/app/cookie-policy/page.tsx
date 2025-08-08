import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Settings, Eye, BarChart, Target, Shield } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Cookie className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600">
            Learn about how we use cookies and similar technologies on our website.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          {/* What are Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cookie className="w-5 h-5 mr-2 text-blue-600" />
                What are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Cookies are small text files that are placed on your device when you visit our website.
                They help us provide you with a better experience by remembering your preferences,
                analyzing how you use our site, and enabling certain functionality.
              </p>
              <p>
                We use cookies and similar technologies (such as web beacons, pixels, and local storage)
                to enhance your experience with PRESTIGE Car Wash services.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-600" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 mr-2 text-red-500" />
                    <h3 className="font-semibold text-gray-900">Necessary Cookies (Always Active)</h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies are essential for the website to function properly and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Authentication and security</li>
                    <li>Shopping cart functionality</li>
                    <li>Form submission and validation</li>
                    <li>Load balancing and performance</li>
                  </ul>
                </div>

                {/* Functional Cookies */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 mr-2 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies enable enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Language and region preferences</li>
                    <li>User interface customization</li>
                    <li>Accessibility settings</li>
                    <li>Service preferences and history</li>
                  </ul>
                </div>

                {/* Analytics Cookies */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-center mb-2">
                    <BarChart className="w-5 h-5 mr-2 text-purple-500" />
                    <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Google Analytics (anonymized)</li>
                    <li>Page views and user journeys</li>
                    <li>Performance monitoring</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>

                {/* Marketing Cookies */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 mr-2 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Social media integration</li>
                    <li>Advertising personalization</li>
                    <li>Campaign tracking</li>
                    <li>Retargeting and remarketing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We use several third-party services that may set their own cookies:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Google Analytics</h4>
                    <p className="text-sm text-gray-600">
                      Helps us understand website usage and improve user experience.
                    </p>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 text-sm underline">
                      Google Privacy Policy
                    </a>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Stripe</h4>
                    <p className="text-sm text-gray-600">
                      Secure payment processing for our services.
                    </p>
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 text-sm underline">
                      Stripe Privacy Policy
                    </a>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Social Media</h4>
                    <p className="text-sm text-gray-600">
                      Facebook, Instagram, and other social media integrations.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Weather API</h4>
                    <p className="text-sm text-gray-600">
                      Weather data for our smart scheduling feature.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Managing Your Cookie Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cookie Consent Manager</h4>
                  <p className="text-gray-700 mb-4">
                    You can manage your cookie preferences using our cookie consent banner that appears
                    when you first visit our website. You can also update your preferences at any time.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Manage Cookie Preferences
                  </button>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Browser Settings</h4>
                  <p className="text-gray-700 mb-2">
                    You can also control cookies through your browser settings:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set up notifications for new cookies</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    Note: Disabling necessary cookies may affect website functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Cookies</h4>
                  <p className="text-gray-700">
                    Temporary cookies that are deleted when you close your browser.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Persistent Cookies</h4>
                  <p className="text-gray-700">
                    Stored on your device for a specific period (typically 1-24 months) or until you delete them.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Automatic Cleanup:</strong> We regularly review and clean up unnecessary cookies
                    to minimize data collection and storage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Cookies?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p>
                  If you have any questions about our use of cookies, please contact us:
                </p>
                <div className="mt-4">
                  <p><strong>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING</strong></p>
                  <p>Email: privacy@prestigecarwash.co.za</p>
                  <p>Phone: +27 78 613 2969</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
