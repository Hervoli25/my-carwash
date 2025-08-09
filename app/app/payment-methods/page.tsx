
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PaymentMethodsClient } from './payment-methods-client';

export default async function PaymentMethodsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <PaymentMethodsClient />;
}
