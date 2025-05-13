'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For redirection after login
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // For loading spinner

// Re-using a simplified version of your Header's Logo or create a specific one
const LoginLogo = () => (
  <div className="flex items-center justify-center mb-6">
    <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loginLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          {/* Using CSS variables for theme consistency */}
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary) / 0.7)' }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#loginLogoGradient)" />
      <path d="M30,55 Q40,30 50,55 T70,55" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="6" />
    </svg>
    <span className="ml-3 text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
      <span style={{ color: 'hsl(var(--primary-foreground))', backgroundColor: 'hsl(var(--primary))' }} className="rounded-sm pb-0.5 px-1">Re.</span>grant
    </span>
  </div>
);


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // --- Replace with your actual authentication logic ---
    // Example:
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'Login failed');
    //   }
    //   // Handle successful login, e.g., store token, update auth context
    //   router.push('/dashboard'); // Redirect to a protected page
    // } catch (err: any) {
    //   setError(err.message);
    // } finally {
    //   setIsLoading(false);
    // }

    // Simulate API call for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (email === 'user@regrant.com' && password === 'password123') {
      console.log('Login successful');
      router.push('/grants'); // Redirect to grants page or dashboard
    } else {
      setError('Invalid email or password. Please try again.');
    }
    // --- End of placeholder logic ---

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md shadow-xl border-border-primary">
        <CardHeader className="text-center">
          <LoginLogo />
          <CardTitle className="text-2xl tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your Re.Grant account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md" role="alert">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password" // Update if you have a forgot password page
                  className="text-sm text-primary hover:underline hover:text-primary/90"
                  tabIndex={-1} // Good for accessibility if button is primary action
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup" // Update if you have a signup page
              className="font-medium text-primary hover:underline hover:text-primary/90"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}