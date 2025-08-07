import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import Workspace from '@/utils/models/workspace.model';
import User from '@/utils/models/user.model'; // Assuming you have a User model

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await Workspace.find({ 'members.user': token.id }).populate('owner', 'name email').populate('members.user', 'name email');

    return NextResponse.json(workspaces, { status: 200 });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Workspace name is required' }, { status: 400 });
    }

    const user = await User.findById(token.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newWorkspace = new Workspace({
      name,
      owner: user._id,
      members: [{ user: user._id, role: 'owner' }],
    });

    await newWorkspace.save();

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}