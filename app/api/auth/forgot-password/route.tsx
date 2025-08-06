import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/utils/models/user.model';

export async function POST(request: Request) {
  try {
    console.log('Forgot password request for email:');
    await dbConnect();
    const { email } = await request.json();
    console.log('Forgot password request for email:', email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return generic error to avoid leaking user existence
      return NextResponse.json({ error: 'If an account exists, an OTP will be sent' }, { status: 200 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration to 1 day from now
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new OTP and reset attempts
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();

    // TODO: Implement email sending logic here
    // Example using a hypothetical email service:
    /*
    await sendEmail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp}. It expires in 24 hours.`,
    });
    */

    return NextResponse.json({ 
      message: 'If an account exists, an OTP will be sent',
      otp
    }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}