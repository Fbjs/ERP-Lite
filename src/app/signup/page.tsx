import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wheat } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full shadow-2xl">
        <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Wheat className="w-10 h-10 text-primary" />
                <h1 className="text-4xl font-headline font-bold text-foreground">Vollkorn</h1>
            </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription className="font-body">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="font-body">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required className="font-body"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required className="font-body"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="font-body">Password</Label>
              <Input id="password" type="password" required  className="font-body"/>
            </div>
            <Link href="/dashboard" className="w-full">
                <Button type="submit" className="w-full font-body">
                    Create Account
                </Button>
            </Link>
          </div>
          <div className="mt-4 text-center text-sm font-body">
            Already have an account?{' '}
            <Link href="/" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
