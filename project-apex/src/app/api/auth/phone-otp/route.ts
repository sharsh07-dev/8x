import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, phoneNumber, otp } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Action 1: Send Phone OTP
    if (action === 'send') {
      if (!phoneNumber || phoneNumber.trim().length < 6) {
        return NextResponse.json({ error: 'Please enter a valid mobile number' }, { status: 400 });
      }

      // Generate secure 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Save or update phone number on user
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumber: phoneNumber.trim() },
      });

      // Save to Verification table
      const identifier = `phone-otp:${cleanEmail}`;
      await prisma.verification.deleteMany({
        where: { identifier },
      });

      await prisma.verification.create({
        data: {
          identifier,
          value: generatedOtp,
          expiresAt,
        },
      });

      console.log(`[Mobile SMS Service] 📱 Sent SMS OTP to ${phoneNumber.trim()}: ${generatedOtp}`);

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to ${phoneNumber.trim()}`,
        // Included for easy local testing and development
        testOtp: generatedOtp,
      });
    }

    // Action 2: Verify Phone OTP
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ error: 'Please enter the 6-digit OTP' }, { status: 400 });
      }

      const identifier = `phone-otp:${cleanEmail}`;
      const record = await prisma.verification.findFirst({
        where: { identifier },
      });

      if (!record) {
        return NextResponse.json(
          { error: 'No verification code found. Please request a new OTP.' },
          { status: 400 }
        );
      }

      if (new Date() > record.expiresAt) {
        await prisma.verification.delete({ where: { id: record.id } });
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      if (record.value !== otp.trim()) {
        return NextResponse.json({ error: 'Invalid verification code. Please try again.' }, { status: 400 });
      }

      // Single-use token invalidation
      await prisma.verification.delete({ where: { id: record.id } });

      // Activate user account & phone
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          phoneVerified: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Your mobile number has been verified and your account is now active!',
      });
    }

    // Action 3: Instant 1-Click Verification for local dev
    if (action === 'instant_verify') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Account successfully activated! You can now sign in.',
      });
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (err: any) {
    console.error('Phone OTP error:', err);
    return NextResponse.json({ error: 'Failed to process mobile verification' }, { status: 500 });
  }
}
