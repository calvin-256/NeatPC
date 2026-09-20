// ===========================================
// NeatPC — Session Provider Wrapper
// ===========================================
// Client component that wraps the app with NextAuth's
// SessionProvider so useSession() works everywhere.

'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
}
