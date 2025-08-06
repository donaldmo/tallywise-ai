import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/utils/models/user.model';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { otp } = await request.json();

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const user = await User.findOne({ otp });

    if (!user) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
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

    // OTP is valid, mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}