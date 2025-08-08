
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface DamageReport {
  id: string;
  type: 'scratch' | 'dent' | 'chip' | 'stain' | 'none';
  severity: 'minor' | 'moderate' | 'major';
  location: { x: number; y: number };
  confidence: number;
  description: string;
}

interface PhotoComparison {
  beforePhoto: string;
  afterPhoto?: string;
  damageReports: DamageReport[];
  qualityScore: number;
  aiAnalysisComplete: boolean;
}

export function AIDamageDetection() {
  const [photoData, setPhotoData] = useState<PhotoComparison>({
    beforePhoto: 'https://cdn.abacus.ai/images/77100dd7-e945-43aa-a419-5bf5249fd87a.png',
    afterPhoto: 'https://cdn.abacus.ai/images/7935c3d8-5a9c-4cdb-8d4e-f0f63c93186c.png',
    damageReports: [
      {
        id: '1',
        type: 'scratch',
        severity: 'minor',
        location: { x: 45, y: 30 },
        confidence: 89,
        description: 'Minor surface scratch on front bumper, 2.5cm length'
      }
    ],
    qualityScore: 94,
    aiAnalysisComplete: true
  });

  const [selectedTab, setSelectedTab] = useState('comparison');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'major': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scratch': return '🔍';
      case 'dent': return '🔨';
      case 'chip': return '💎';
      case 'stain': return '🧽';
      default: return '✅';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered Damage Detection</h3>
              <p className="text-sm text-gray-600">Automated vehicle inspection & quality assurance</p>
            </div>
            <Badge className="bg-purple-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI POWERED
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{photoData.qualityScore}%</div>
              <div className="text-sm text-gray-600">Quality Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{photoData.damageReports.length}</div>
              <div className="text-sm text-gray-600">Issues Detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">98.5%</div>
              <div className="text-sm text-gray-600">AI Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inspection Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Before/After</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="report">Full Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Before Service</h4>
                    <Badge variant="outline">Pre-inspection</Badge>
                  </div>
                  <div className="relative">
                    <Image
                      src={photoData.beforePhoto}
                      alt="Before service"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover rounded border"
                    />
                    {/* Damage markers */}
                    {photoData.damageReports.map((damage) => (
                      <div
                        key={damage.id}
                        className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold transform -translate-x-3 -translate-y-3 animate-pulse"
                        style={{ 
                          left: `${damage.location.x}%`, 
                          top: `${damage.location.y}%` 
                        }}
                      >
                        !
                      </div>
                    ))}
                  </div>
                </div>

                {/* After Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">After Service</h4>
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                  </div>
                  {photoData.afterPhoto ? (
                    <Image
                      src={photoData.afterPhoto}
                      alt="After service"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <p>After photos will be uploaded upon completion</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                {photoData.damageReports.map((damage) => (
                  <motion.div
                    key={damage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{getTypeIcon(damage.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{damage.type}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(damage.severity)}>
                            {damage.severity}
                          </Badge>
                          <Badge variant="outline">
                            {damage.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{damage.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Location: ({damage.location.x}%, {damage.location.y}%) from top-left
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {photoData.damageReports.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Issues Detected</h4>
                    <p className="text-gray-600">AI analysis found no visible damage or issues</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="report" className="space-y-4">
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Inspection Report #INS-2024-001</h3>
                    <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Report
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vehicle</label>
                      <p className="text-sm text-gray-900">2022 BMW X5 (License: CAD-123-GP)</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Service Type</label>
                      <p className="text-sm text-gray-900">Premium Wash & Wax</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Quality Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Exterior Cleanliness</span>
                          <span className="text-sm font-medium">96%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Interior Cleanliness</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Wax Application</span>
                          <span className="text-sm font-medium">98%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Detail Work</span>
                          <span className="text-sm font-medium">94%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Overall Satisfaction</span>
                          <span className="text-sm font-medium text-green-600">Excellent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Technician Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      "Vehicle was in excellent condition. Applied premium wax treatment with extra attention to minor scratches. Customer should consider paint protection for optimal results."
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload New Photos */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Additional Photos for Analysis
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Upload photos for AI-powered damage detection and quality analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
