"use client";

import React, { useEffect, useState } from "react";
import HITlogo from "./HITLogo";
import Link from "next/link";
import { auth } from "@/lib/firebase-client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";

export default function NavigationBar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (auth) {
      return onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
    }
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Tag */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-32 md:w-36 block">
            <HITlogo />
          </Link>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="https://linktr.ee/Health._it"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-zinc-400 hover:text-white transition">
            <span>Health IT</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </Link>

          {user && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer font-medium">
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
