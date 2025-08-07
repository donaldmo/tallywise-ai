import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Invitation from '@/utils/models/invitation.model';
import Workspace from '@/utils/models/workspace.model';
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
      return NextResponse.json({ message: 'Unauthorized to accept this invitation' }, { status: 403 });
    }

    const workspace = await Workspace.findById(invitation.workspace);

    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(
      (member: any) => member.user.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      invitation.status = 'accepted'; // Still mark as accepted even if already a member
      await invitation.save();
      return NextResponse.json({ message: 'You are already a member of this workspace.' }, { status: 200 });
    }

    workspace.members.push({ user: user._id, role: invitation.role });
    await workspace.save();

    invitation.status = 'accepted';
    await invitation.save();

    return NextResponse.json({ message: 'Invitation accepted', workspace }, { status: 200 });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}