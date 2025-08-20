import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { supportedLanguages } from '@/lib/i18n/languages';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { language } = await req.json();

    if (!language || !supportedLanguages.includes(language)) {
      return NextResponse.json({ error: 'Invalid language code' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { language },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Language update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
