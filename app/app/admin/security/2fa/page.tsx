import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import QRCode from 'qrcode';

export default async function TwoFASetupPage() {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) notFound();

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/security/2fa/setup`, { cache: 'no-store' });
  const data = await res.json();

  const qr = await QRCode.toDataURL(data.otpauth_url);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-md py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Enable 2FA</h1>
        <p className="mb-4">Scan this QR code in Google Authenticator or Authy, then click Enable.</p>
        <img src={qr} alt="2FA QR" className="mb-4 border rounded" />
        <form action={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/security/2fa/enable`} method="post">
          <input type="hidden" name="secret" value={data.secret} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" formAction={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/security/2fa/enable`}>Enable 2FA</button>
        </form>
      </main>
    </div>
  );
}

