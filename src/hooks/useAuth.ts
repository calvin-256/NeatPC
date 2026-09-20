// ===========================================
// NeatPC — Auth Helper Hooks & Utilities
// ===========================================
// Convenient wrappers around NextAuth for use in components.

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

/**
 * Get the current auth state with convenience methods.
 *
 * @example
 * const { user, isLoggedIn, login, logout } = useAuth();
 * if (isLoggedIn) console.log(user.name);
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    /** The current user, or null if not logged in */
    user: session?.user ?? null,
    /** User ID from the JWT token */
    userId: (session?.user as { id?: string })?.id ?? null,
    /** Whether the user is authenticated */
    isLoggedIn: status === 'authenticated',
    /** Whether auth state is still loading */
    isLoading: status === 'loading',
    /** Trigger sign in (redirects to login page) */
    login: () => signIn(),
    /** Trigger sign out */
    logout: () => signOut({ callbackUrl: '/' }),
    /** Raw session object */
    session,
  };
}
