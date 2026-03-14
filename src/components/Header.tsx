"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/firebase";
import { Skeleton } from "./ui/skeleton";
import { Activity, Home, Sparkles, LayoutDashboard, History, LogOut } from 'lucide-react';
import React from 'react';


export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  return (
    <header className="glass-panel sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6 md:px-8">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="p-2 bg-primary/10 rounded-xl">
              <Logo className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl md:text-2xl font-bold font-headline tracking-tighter text-gradient">
            JobFit AI
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          {isUserLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground hidden lg:inline-block truncate max-w-[150px]">
                {user.email}
              </span>
              <Button asChild variant="ghost" className="rounded-full hidden sm:inline-flex">
                <Link href="/history">History</Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="rounded-full shadow-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="rounded-full hidden sm:inline-flex">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="rounded-full shadow-md shadow-primary/20">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
