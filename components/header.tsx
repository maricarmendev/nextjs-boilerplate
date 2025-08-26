"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { UserMenu } from "./auth/user-menu";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-lg font-semibold">
          Lorem
        </Link>

        <div className="flex gap-2 items-center">

          {session?.user?.role === "admin" && (
            <Button variant="outline" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          
          <ThemeToggle />

          {session?.user ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
