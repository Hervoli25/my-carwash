import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

async function createStaff(formData: FormData) {
  'use server';
  const payload: any = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    role: formData.get('role') as string,
    allowedIPs: (formData.get('allowedIPs') as string || '').split(',').map(s => s.trim()).filter(Boolean),
  };
  const workNumber = formData.get('workNumber') as string;
  const lastName = formData.get('lastName') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username) payload.username = username;
  else {
    payload.workNumber = workNumber;
    payload.lastName = lastName;
  }
  if (password) payload.password = password;

  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/admin-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export default async function StaffManagementPage() {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) {
    notFound();
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/admin-users`, { cache: 'no-store' });
  const data = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-5xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Staff/Admin Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" className="w-full border rounded px-3 py-2">
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Allowed IPs (optional, comma separated)</label>
                <input name="allowedIPs" className="w-full border rounded px-3 py-2" />
              </div>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Work Number</label>
                  <input name="workNumber" className="w-full border rounded px-3 py-2" placeholder="e.g. 1001" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input name="lastName" className="w-full border rounded px-3 py-2" placeholder="e.g. Dlamini" />
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500">or</div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input name="username" className="w-full border rounded px-3 py-2" placeholder="e.g. 1001.dlamini" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password (optional to set)</label>
                  <input name="password" type="password" className="w-full border rounded px-3 py-2" placeholder="Auto-generated if empty" />
                </div>
              </div>

              <div className="col-span-2">
                <Button type="submit">Create Account</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Staff/Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data?.users?.map((u: any) => (
                <li key={u.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium">{u.name} ({u.username})</div>
                    <div className="text-sm text-gray-600">{u.email} • {u.role} • Created {new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-500">{u.isActive ? 'Active' : 'Inactive'}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

