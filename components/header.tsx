import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

export const Header = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <Link href="/">
          Lorem
        </Link>

        <div className="flex gap-2">
          <Button>Login</Button>
          <Button>Register</Button>
        </div>
      </div>
    </div>
  )
}

