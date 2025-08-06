'use client'

import { GalleryVerticalEnd } from "lucide-react"
import config from "@/lib/config"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from 'react';
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      toast.loading('Loading...');
      console.log('Submitting forgot password request for email:', email);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '');
      }

      // Dismiss the loading toast and show success message
      toast.dismiss();
      toast.success('An OTP has been sent to your email!');
      setSubmitting(false);

      // Clear form fields
      setEmail('');

      // Redirect to dashboard
      router.push('/auth/reset-password');
    } catch (err) {
      setSubmitting(false);
      toast.dismiss();
      toast.error('An error occurred while sending the OTP');
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {config.siteName}
        </a>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address to receive an OTP to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                  <div className="grid gap-6">
                    <div className="grid gap-3">

                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full"
                        onClick={handleSubmit}
                        disabled={!email || submitting}
                      >
                        Request OTP
                      </Button>
                    </div>
                  </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}