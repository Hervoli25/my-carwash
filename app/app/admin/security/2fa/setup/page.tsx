'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Smartphone, Key, Copy, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export default function TwoFactorSetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const required = searchParams.get('required') === 'true';
  
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const [downloadAttempts, setDownloadAttempts] = useState(0);
  const [downloadTimestamp, setDownloadTimestamp] = useState<string | null>(null);

  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    try {
      const response = await fetch('/api/admin/security/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data);
        
        // Generate QR code
        const qrData = await QRCode.toDataURL(data.qrCodeUrl);
        setQrCodeDataUrl(qrData);
      } else {
        toast.error('Failed to initialize 2FA setup');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error('System error during 2FA initialization');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;
    
    // Professional security: Limit download attempts
    if (downloadAttempts >= 3) {
      toast.error('Maximum download attempts reached. Contact system administrator.');
      return;
    }
    
    const timestamp = new Date().toLocaleString();
    const downloadId = Date.now();
    
    const content = [
      '# EKHAYA CAR WASH - ENTERPRISE 2FA BACKUP CODES',
      '# ⚠️  CONFIDENTIAL - KEEP THESE CODES ABSOLUTELY SECURE ⚠️',
      '# ═══════════════════════════════════════════════════════',
      `# Generated: ${timestamp}`,
      `# Admin: ${session?.user?.username}`,
      `# Download ID: ${downloadId}`,
      `# Security Level: MAXIMUM`,
      '',
      '🔐 EMERGENCY BACKUP CODES:',
      'Use these codes ONLY if you lose access to your authenticator app',
      '',
      ...setupData.backupCodes.map((code, index) => `   ${(index + 1).toString().padStart(2, '0')}. ${code}`),
      '',
      '📋 SECURITY INSTRUCTIONS:',
      '⚠️  Each code can ONLY be used ONCE',
      '⚠️  Store in a SECURE location (password manager recommended)',
      '⚠️  DO NOT share these codes with anyone',
      '⚠️  Generate new codes if these are compromised',
      '⚠️  Delete this file after storing codes securely',
      '',
      '🔴 CRITICAL: If these codes are lost or compromised,',
      '    contact system administrator immediately.',
      '',
      '© 2025 Ekhaya Car Wash - Enterprise Security System'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EKHAYA-2FA-BACKUP-CODES-${downloadId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Professional security tracking
    setDownloadAttempts(prev => prev + 1);
    setDownloadTimestamp(timestamp);
    setBackupCodesSaved(true);
    
    toast.success('🔐 Enterprise backup codes downloaded securely');
    
    // Log the download for security audit
    console.log(`🔐 Admin ${session?.user?.username} downloaded 2FA backup codes at ${timestamp}`);
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/security/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationCode,
          saveBackupCodes: backupCodesSaved 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStep('complete');
        toast.success('🔐 2FA successfully enabled!');
        
        // Professional redirect with proper session handling
        setTimeout(() => {
          // Use our custom redirect endpoint that checks database status
          window.location.href = '/api/admin/redirect-dashboard';
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error('System error during verification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4 border-4 border-green-500">
            <Shield className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {required ? 'Mandatory 2FA Setup' : 'Enable Two-Factor Authentication'}
          </h1>
          <p className="text-slate-300">Enterprise-grade security for admin access</p>
        </div>

        {step === 'setup' && (
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-green-400" />
                Step 1: Configure Authenticator App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-slate-300 mt-2 text-sm">
                    Scan with your authenticator app
                  </p>
                </div>
              )}

              {/* Manual Entry */}
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Manual Entry (if QR code doesn't work):</h3>
                <div className="flex items-center space-x-2">
                  <code className="bg-slate-600 px-3 py-2 rounded text-green-400 flex-1 text-sm font-mono">
                    {setupData?.secret || 'Loading...'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData?.secret || '')}
                    className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Backup Codes */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <h3 className="text-amber-400 font-medium mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Emergency Backup Codes
                </h3>
                <p className="text-slate-300 text-sm mb-3">
                  {!backupCodesSaved 
                    ? 'Download these codes now. You\'ll need them if you lose your authenticator device.'
                    : `✅ Backup codes downloaded securely ${downloadTimestamp ? `at ${downloadTimestamp}` : ''}`
                  }
                </p>
                
                <div className="flex flex-col space-y-2">
                  {downloadAttempts < 3 ? (
                    <Button
                      onClick={downloadBackupCodes}
                      disabled={backupCodesSaved}
                      variant="outline"
                      className={`w-full transition-all duration-300 ${
                        backupCodesSaved 
                          ? 'bg-green-700 border-green-600 text-white cursor-not-allowed'
                          : 'bg-amber-600 border-amber-500 text-white hover:bg-amber-700'
                      }`}
                    >
                      {backupCodesSaved ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Backup Codes Downloaded Securely
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Backup Codes (Required)
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                      <p className="text-red-400 text-sm">
                        🚨 Maximum downloads reached. Contact system administrator if codes are needed.
                      </p>
                    </div>
                  )}
                  
                  {downloadAttempts > 0 && (
                    <p className="text-xs text-slate-400">
                      Downloads: {downloadAttempts}/3 • Security Level: Maximum
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setStep('verify')}
                disabled={!setupData || !backupCodesSaved}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                Continue to Verification
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'verify' && (
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-400" />
                Step 2: Verify Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                Enter the 6-digit code from your authenticator app to complete setup:
              </p>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl font-mono tracking-widest bg-slate-700 border-slate-600 text-white"
                  maxLength={6}
                />
                
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('setup')}
                    className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Back to Setup
                  </Button>
                  <Button
                    onClick={verifyAndEnable}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? 'Verifying...' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card className="bg-slate-800 border-slate-600">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">2FA Successfully Enabled!</h2>
              <p className="text-slate-300 mb-4">
                Your admin account is now secured with enterprise-grade two-factor authentication.
              </p>
              <div className="space-y-3">
                <p className="text-green-400 text-sm">
                  Redirecting to admin dashboard...
                </p>
                <Button
                  onClick={() => {
                    // Use our custom redirect endpoint that checks database status
                    window.location.href = '/api/admin/redirect-dashboard';
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Access Admin Dashboard Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="text-center mt-6 text-slate-400 text-xs">
          <p>🔒 This setup process uses bank-level security standards</p>
          <p>🛡️ Your secret keys are encrypted and never stored in plain text</p>
        </div>
      </div>
    </div>
  );
}