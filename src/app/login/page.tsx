'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Header from '@/components/Header';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        router.push('/');
      } else {
         throw new Error("Auth service not available.");
      }
    } catch (error) {
      let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Invalid email or password.';
            break;
          case 'auth/invalid-email':
            description = 'Please enter a valid email.';
            break;
          default:
            description = 'An error occurred during login. Please try again.';
            break;
        }
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
      });
    }
  };
  
  if (isUserLoading || (!isUserLoading && user)) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Blob Background */}
      <div className="blob-bg bg-primary w-[400px] h-[400px] top-[-50px] left-[-100px]" />
      <div className="blob-bg bg-blue-500 w-[500px] h-[500px] bottom-[-150px] right-[-150px] animation-delay-2000" />
      
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="relative w-full max-w-md">
           {/* Subtle glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-3xl blur opacity-20" />
          
          <Card className="glass-card relative rounded-3xl border-0 ring-1 ring-border/50">
            <CardHeader className="space-y-2 pb-6 pt-8 px-8 text-center">
              <CardTitle className="text-3xl font-bold font-headline tracking-tight text-gradient">Welcome Back</CardTitle>
              <CardDescription className="text-base text-muted-foreground">Enter your details to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input className="rounded-full bg-muted/50 border-border/60 focus-visible:ring-primary/30 h-12 px-4" type="email" placeholder="hello@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Password</FormLabel>
                        <FormControl>
                          <Input className="rounded-full bg-muted/50 border-border/60 focus-visible:ring-primary/30 h-12 px-4" type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full rounded-full h-12 text-md shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                    Sign In
                  </Button>
                </form>
              </Form>
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign up for free
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
