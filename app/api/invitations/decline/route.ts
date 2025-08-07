import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Invitation from '@/utils/models/invitation.model';
import User from '@/utils/models/user.model';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { invitationToken } = await req.json();

    if (!invitationToken) {
      return NextResponse.json({ message: 'Invitation token is required' }, { status: 400 });
    }

    const invitation = await Invitation.findOne({ token: invitationToken, status: 'pending' });

    if (!invitation) {
      return NextResponse.json({ message: 'Invalid or expired invitation' }, { status: 404 });
    }

    const user = await User.findById(token.id);

    if (!user || user.email !== invitation.inviteeEmail) {
      return NextResponse.json({ message: 'Unauthorized to decline this invitation' }, { status: 403 });
    }

    invitation.status = 'declined';
    await invitation.save();

    return NextResponse.json({ message: 'Invitation declined' }, { status: 200 });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}