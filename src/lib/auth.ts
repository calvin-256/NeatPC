// ===========================================
// NeatPC — NextAuth Configuration
// ===========================================
// Central auth config used by the API route and
// anywhere we need to check the session server-side.

import { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - PrismaAdapter types are slightly off between versions
  adapter: PrismaAdapter(prisma),

  providers: [
    // --- Google OAuth ---
    // Enable by adding GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // --- GitHub OAuth ---
    // Enable by adding GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env.local
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),

    // --- Dev Credentials Login ---
    // Quick login for development. In production, only OAuth is used.
    CredentialsProvider({
      id: 'dev-login',
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'dev@neatpc.com' },
        name: { label: 'Name', type: 'text', placeholder: 'Dev User' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== 'development') {
          return null; // Only allow in dev
        }

        const email = credentials?.email || 'dev@neatpc.com';
        const name = credentials?.name || 'Dev User';

        // Find or create the dev user
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { email, name },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    // Use JWT for credentials provider compatibility
    // Database sessions are used when only OAuth providers are configured
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      // On sign in, add user ID to token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Add user ID to the session object
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login', // Custom sign-in page (we'll build this later)
    error: '/login',  // Redirect errors to login page
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
};
