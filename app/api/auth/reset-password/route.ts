import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/utils/models/user.model';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const user = await User.findOne({ email, otp });

    if (!user) {
      return NextResponse.json({ error: 'Invalid OTP or email' }, { status: 400 });
    }

    // Check if OTP has expired
    if (user.otpExpires < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Check attempt limit
    if (user.otpAttempts >= 5) {
      return NextResponse.json({ error: 'Maximum verification attempts exceeded' }, { status: 400 });
    }

    // Increment attempts
    user.otpAttempts += 1;
    await user.save();

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Update password and clear OTP fields
    user.password = newPassword; // Let pre('save') hook handle hashing
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}