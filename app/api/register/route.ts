import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/utils/models/user.model';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration to 1 day from now
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      email,
      password,
      name,
      otp,
      otpExpires,
      otpAttempts: 0,
      isVerified: false,
    });
    await user.save();

    // TODO: Implement email sending logic here
    // Example using a hypothetical email service:
    /*
    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 24 hours.`,
    });
    */

    return NextResponse.json({ 
      otp,
      message: 'User created successfully. Please check your email for the OTP.' 
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}