'use client';

import { useState, FormEvent } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, User, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    twoFactorCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [need2FA, setNeed2FA] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  // Get client IP
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/get-ip');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (attempts >= 3) {
      toast.error('Too many failed attempts. Please wait 15 minutes.');
      setIsLoading(false);
      return;
    }

    try {
      const ip = await getClientIP();

      const result = await signIn('admin-credentials', {
        username: credentials.username,
        password: credentials.password,
        twoFactorCode: credentials.twoFactorCode,
        ip: ip,
        redirect: false,
      });

      if (result?.error) {
        setAttempts(prev => prev + 1);
        
        if (result.error.includes('2FA')) {
          setNeed2FA(true);
          toast.error('Invalid 2FA code');
        } else if (result.error.includes('rate')) {
          toast.error('Too many attempts. Access temporarily blocked.');
        } else if (result.error.includes('locked')) {
          toast.error('Account temporarily locked. Contact system administrator.');
        } else {
          toast.error('Invalid credentials or access denied');
        }
      } else {
        toast.success('Admin access granted');
        const session = await getSession();
        if (session) {
          router.push('/admin/dashboard');
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('System error. Please try again.');
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Warning Banner */}
      <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-center text-sm">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        AUTHORIZED PERSONNEL ONLY - All access attempts are logged and monitored
      </div>

      <div className="w-full max-w-md mt-12">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4 border-4 border-slate-600">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-300">Secure Management Portal</p>
          <p className="text-slate-400 text-sm mt-2">
            High-security access for authorized administrators only
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-slate-800 border-slate-600 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-white flex items-center justify-center">
              <Lock className="w-5 h-5 mr-2 text-red-400" />
              Secure Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter admin username"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter secure password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2FA Code */}
              {need2FA && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">2FA Authentication Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={credentials.twoFactorCode}
                      onChange={(e) => handleInputChange('twoFactorCode', e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center tracking-widest font-mono text-lg"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>
              )}

              {/* Security Status */}
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Security Level:</span>
                  <span className="text-red-400 font-bold">MAXIMUM</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-300">Failed Attempts:</span>
                  <span className={attempts >= 2 ? 'text-red-400' : 'text-slate-400'}>
                    {attempts}/3
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || attempts >= 3}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {need2FA ? 'Verify 2FA & Access' : 'Secure Login'}
                  </>
                )}
              </Button>

              {attempts >= 3 && (
                <div className="text-center text-red-400 text-sm">
                  Access blocked. Wait 15 minutes or contact system administrator.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center mt-6 text-slate-400 text-xs">
          <p>⚠️ This system is monitored and protected</p>
          <p>Unauthorized access attempts will be reported</p>
          <p className="mt-2">IP Address logged • Session encrypted • 2FA enforced</p>
        </div>
      </div>
    </div>
  );
}