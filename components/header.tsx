"use client";

import Link from 'next/link'
import React from 'react'
import { LoginDialog } from './auth/login-dialog'
import { RegisterDialog } from './auth/register-dialog'
import { UserMenu } from './auth/user-menu'
import { useSession } from '@/lib/auth-client'

export const Header = () => {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-lg font-semibold">
          Lorem
        </Link>

        <div className="flex gap-2 items-center">
          {session?.user ? (
            <UserMenu />
          ) : (
            <>
              <LoginDialog />
              <RegisterDialog />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

