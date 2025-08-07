import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Invitation from '@/utils/models/invitation.model';
import Workspace from '@/utils/models/workspace.model';
import User from '@/utils/models/user.model';
import crypto from 'crypto';
import { initAgenda } from '@/utils/agenda';

const secret = process.env.NEXTAUTH_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Ensure this is set in your .env

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, inviteeEmail, role } = await req.json();

    if (!workspaceId || !inviteeEmail || !role) {
      return NextResponse.json({ message: 'Workspace ID, invitee email, and role are required' }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    // Check if the inviter is an owner or admin of the workspace
    const inviterIsOwnerOrAdmin = workspace.members.some(
      (member: any) => member.user.toString() === token.id && (member.role === 'owner' || member.role === 'admin')
    );

    if (!inviterIsOwnerOrAdmin) {
      return NextResponse.json({ message: 'Forbidden: Only owners and admins can invite members' }, { status: 403 });
    }

    // Generate a unique token for the invitation
    const invitationToken = crypto.randomBytes(32).toString('hex');

    const newInvitation = new Invitation({
      workspace: workspaceId,
      inviter: token.id,
      inviteeEmail,
      token: invitationToken,
      role,
    });

    await newInvitation.save();

    // Get inviter details for the email
    const inviterUser = await User.findById(token.id);
    const inviterName = inviterUser?.name || inviterUser?.email || 'Someone';

    // Schedule email to be sent via Agenda
    const agenda = await initAgenda();
    agenda.now('send invitation email', {
      to: inviteeEmail,
      subject: `Invitation to join ${workspace.name} on YourApp`,
      html: `
        <p>Hi there,</p>
        <p>${inviterName} has invited you to join the workspace <strong>${workspace.name}</strong> as a <strong>${role}</strong>.</p>
        <p>Click the link below to accept the invitation:</p>
        <p><a href="${BASE_URL}/auth/verify-email?token=${invitationToken}">Accept Invitation</a></p>
        <p>If you don't have an account, you can sign up after clicking the link.</p>
        <p>Best regards,</p>
        <p>The YourApp Team</p>
      `,
    });

    return NextResponse.json(newInvitation, { status: 201 });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get invitations sent by the current user
    const sentInvitations = await Invitation.find({ inviter: token.id })
      .populate('workspace', 'name')
      .populate('inviter', 'name email');

    // Get invitations addressed to the current user's email
    const user = await User.findById(token.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const receivedInvitations = await Invitation.find({ inviteeEmail: user.email, status: 'pending' })
      .populate('workspace', 'name')
      .populate('inviter', 'name email');

    return NextResponse.json({ sent: sentInvitations, received: receivedInvitations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}