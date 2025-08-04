import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'This is a protected resource',
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      accessToken: session.accessToken,
    },
  });
}