import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Scale, Shield, Info, FileText, Gavel } from 'lucide-react';

export default function LegalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Gavel className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Disclaimer</h1>
          <p className="text-xl text-gray-600">
            Important legal information regarding our services and limitations.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          {/* General Disclaimer */}
          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                General Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700">
                The information provided by PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING ("Company," "we," "our," or "us")
                on our website, mobile application, and through our services is for general informational purposes only.
                All information is provided in good faith, however we make no representation or warranty of any kind,
                express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness
                of any information.
              </p>
              <p className="text-gray-700 font-medium">
                UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED
                AS A RESULT OF THE USE OF OUR SERVICES OR RELIANCE ON ANY INFORMATION PROVIDED.
              </p>
            </CardContent>
          </Card>

          {/* Service Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Service Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Car Wash Services</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Results may vary based on vehicle condition, age, and type of dirt/stains</li>
                    <li>Some stains, scratches, or damage may be permanent and not removable</li>
                    <li>Weather conditions may affect service quality and drying times</li>
                    <li>Certain vehicle modifications or accessories may limit our service capabilities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Technology Features</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>AI damage detection is assistive technology and may not identify all issues</li>
                    <li>Real-time tracking depends on network connectivity and may experience delays</li>
                    <li>Weather-based scheduling relies on third-party weather data which may be inaccurate</li>
                    <li>Voice assistant functionality requires compatible devices and clear speech</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2 text-purple-600" />
                Liability Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Maximum Liability</h4>
                  <p className="text-yellow-700 text-sm">
                    Our total liability for any claim arising from our services shall not exceed the amount
                    paid for the specific service in question, up to a maximum of R5,000 (Five Thousand Rand).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Excluded Damages</h4>
                  <p className="text-gray-700 mb-2">We are not liable for:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Pre-existing damage, wear, or defects not documented in our initial inspection</li>
                    <li>Damage to aftermarket modifications, accessories, or non-standard equipment</li>
                    <li>Loss of personal items left in vehicles</li>
                    <li>Indirect, consequential, or punitive damages</li>
                    <li>Loss of use, income, or business opportunities</li>
                    <li>Damage caused by acts of nature, theft, or vandalism while on our premises</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Insurance Coverage</h4>
                  <p className="text-gray-700">
                    We maintain comprehensive general liability and professional indemnity insurance.
                    Claims exceeding our policy limits will be handled according to our insurance terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Data and Privacy Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Photo Documentation</h4>
                  <p className="text-gray-700">
                    Photos taken of your vehicle are for quality assurance and service documentation.
                    While we strive for accuracy, photos may not capture all details or may be affected
                    by lighting conditions.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                  <p className="text-gray-700">
                    Our AI damage detection system is designed to assist with quality control but should
                    not be considered a professional vehicle inspection. For comprehensive damage assessment,
                    consult a qualified automotive professional.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Security</h4>
                  <p className="text-gray-700">
                    While we implement industry-standard security measures, no system is completely secure.
                    We cannot guarantee absolute protection against unauthorized access, alteration, or destruction of data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-indigo-600" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Payment Processing</h4>
                  <p className="text-gray-700">
                    Payment processing is handled by Stripe, Inc. We are not responsible for payment processing
                    errors, delays, or security issues related to third-party payment services.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">External Links</h4>
                  <p className="text-gray-700">
                    Our website may contain links to external sites. We have no control over and assume no
                    responsibility for the content, privacy policies, or practices of any third-party sites.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Weather Data</h4>
                  <p className="text-gray-700">
                    Weather information is provided by third-party services and may be inaccurate or outdated.
                    We are not responsible for decisions made based on weather data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700">
                This disclaimer and all matters relating to your use of our services shall be governed by
                and construed in accordance with the laws of South Africa. Any disputes arising from or
                relating to our services shall be subject to the exclusive jurisdiction of the courts of
                South Africa.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Dispute Resolution:</strong> We encourage resolution of disputes through direct
                  communication. If necessary, disputes may be resolved through mediation before pursuing
                  legal action.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p><strong>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING</strong></p>
                <p>30 Lower Piers Road, Wynberg, Cape Town</p>
                <p>Phone: +27 78 613 2969</p>
                <p>Email: info@prestigecarwash.co.za</p>
                <p>Legal inquiries: legal@prestigecarwash.co.za</p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    For urgent legal matters or insurance claims, please contact us immediately at
                    +27 78 613 2969 or legal@prestigecarwash.co.za
                  </p>
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
