
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Car } from 'lucide-react';
import Link from 'next/link';

export default function PremiumServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Wash & Wax
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-3xl font-bold text-blue-600">R150</span>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span className="text-gray-600">(367 reviews)</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <Link href="/book?service=premium">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Car className="w-5 h-5 mr-2" />
                Book This Service
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
