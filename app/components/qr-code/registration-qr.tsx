
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Share2, Smartphone, UserPlus, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCodeLib from 'qrcode';

interface QRCodeGeneratorProps {
  registrationUrl?: string;
  membershipTier?: string;
}

export function RegistrationQR({ 
  registrationUrl = "https://prestigecarwash.com/register",
  membershipTier = "VIP"
}: QRCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code using the qrcode library
  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Generate QR code as data URL
      const dataUrl = await QRCodeLib.toDataURL(registrationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      
      // Also generate on canvas for download functionality
      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, registrationUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, [registrationUrl]);

  const downloadQR = () => {
    // Implementation for downloading QR code
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'ekhaya-carwash-registration-qr.png';
      link.href = canvasRef.current.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Ekhaya Car Wash VIP',
          text: 'Scan this QR code to register for exclusive VIP membership!',
          url: registrationUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(registrationUrl);
        alert('Registration URL copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <QrCode className="w-8 h-8 text-blue-600 mr-2" />
            <Badge className="bg-yellow-500 text-black px-3 py-1">
              <Gift className="w-4 h-4 mr-1" />
              {membershipTier} INVITATION
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            Join Our VIP Program
          </CardTitle>
          <CardDescription>
            Scan to register and unlock exclusive benefits
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* QR Code Display */}
          <motion.div
            className="relative bg-white p-6 rounded-lg shadow-inner border-2 border-dashed border-blue-300"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* QR Code */}
            <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
              {isGenerating ? (
                <motion.div
                  className="flex items-center space-x-2 text-blue-600"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <QrCode className="w-8 h-8" />
                  <span className="text-sm">Generating...</span>
                </motion.div>
              ) : qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Registration QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-sm">No QR Code</div>
              )}
            </div>

            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-4 border-t-4 border-blue-600"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-r-4 border-t-4 border-blue-600"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-4 border-b-4 border-blue-600"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-4 border-b-4 border-blue-600"></div>
          </motion.div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Smartphone className="w-4 h-4" />
              <span>Scan with your phone camera</span>
            </div>
            <div className="text-xs text-gray-500">
              Or visit: {registrationUrl}
            </div>
          </div>

          {/* Benefits Preview */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-yellow-800 mb-2 flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              VIP Benefits Include:
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 10% off all services</li>
              <li>• Free monthly wash</li>
              <li>• Priority booking</li>
              <li>• Loyalty points & rewards</li>
              <li>• Exclusive member events</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate QR'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQR}
              className="px-3"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={shareQR}
              className="px-3"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden canvas for download functionality */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </motion.div>
  );
}
