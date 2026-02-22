'use client';

import { SignOutButton } from '@clerk/nextjs';

interface SignOutLinkProps {
  className?: string;
  children: React.ReactNode;
}

export default function SignOutLink({ className, children }: SignOutLinkProps) {
  return (
    <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
      <button type="button" className={className}>
        {children}
      </button>
    </SignOutButton>
  );
}
