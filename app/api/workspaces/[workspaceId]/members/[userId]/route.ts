import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Workspace from '@/utils/models/workspace.model';

const secret = process.env.NEXTAUTH_SECRET;

export async function PUT(req: NextRequest, { params }: { params: { workspaceId: string; userId: string } }) {
  await dbConnect();
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, userId } = params;
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ message: 'Role is required' }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    // Check if the current user is an owner or admin of the workspace
    const currentUserIsOwnerOrAdmin = workspace.members.some(
      (member: any) => member.user.toString() === token.id && (member.role === 'owner' || member.role === 'admin')
    );

    if (!currentUserIsOwnerOrAdmin) {
      return NextResponse.json({ message: 'Forbidden: Only owners and admins can change member roles' }, { status: 403 });
    }

    // Find the member to update
    const memberIndex = workspace.members.findIndex((member: any) => member.user.toString() === userId);

    if (memberIndex === -1) {
      return NextResponse.json({ message: 'Member not found in this workspace' }, { status: 404 });
    }

    // Prevent changing the owner's role or changing the owner's role if the current user is not the owner
    if (workspace.members[memberIndex].role === 'owner' && token.id !== workspace.owner.toString()) {
      return NextResponse.json({ message: 'Forbidden: Only the owner can change their own role' }, { status: 403 });
    }

    // If the target member is the owner, and the new role is not owner, only the owner can change it.
    if (workspace.members[memberIndex].role === 'owner' && role !== 'owner' && workspace.owner.toString() !== token.id) {
        return NextResponse.json({ message: 'Forbidden: Only the owner can change the owner\'s role' }, { status: 403 });
    }

    workspace.members[memberIndex].role = role;
    await workspace.save();

    return NextResponse.json({ message: 'Member role updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { workspaceId: string; userId: string } }) {
    await dbConnect();
    try {
      const token = await getToken({ req, secret });
  
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const { workspaceId, userId } = params;
  
      const workspace = await Workspace.findById(workspaceId);
  
      if (!workspace) {
        return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
      }
  
      // Check if the current user is an owner or admin of the workspace
      const currentUserIsOwnerOrAdmin = workspace.members.some(
        (member: any) => member.user.toString() === token.id && (member.role === 'owner' || member.role === 'admin')
      );
  
      if (!currentUserIsOwnerOrAdmin) {
        return NextResponse.json({ message: 'Forbidden: Only owners and admins can remove members' }, { status: 403 });
      }
  
      // Prevent removing the owner unless the owner is removing themselves
      if (workspace.owner.toString() === userId && workspace.owner.toString() !== token.id) {
        return NextResponse.json({ message: 'Forbidden: Only the owner can remove themselves' }, { status: 403 });
      }

      // Prevent an admin from removing the owner
      if (workspace.owner.toString() === userId && workspace.members.find((member:any) => member.user.toString() === token.id)?.role === 'admin') {
        return NextResponse.json({ message: 'Forbidden: Admins cannot remove the owner' }, { status: 403 });
      }
  
      const initialMemberCount = workspace.members.length;
      workspace.members = workspace.members.filter((member: any) => member.user.toString() !== userId);
  
      if (workspace.members.length === initialMemberCount) {
        return NextResponse.json({ message: 'Member not found in this workspace' }, { status: 404 });
      }
  
      await workspace.save();
  
      return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error removing member:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }