import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth configuration for Sijambul Merah admin.
 *
 * Single shared admin account — credentials come from environment variables.
 * In production, replace with a real User model + bcrypt-hashed passwords.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@sijambulmerah.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (
          credentials.email === ADMIN_EMAIL &&
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: "1",
            email: ADMIN_EMAIL,
            name: "Admin Sijambul Merah",
            role: "owner",
          } as any;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "owner";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      name?: string | null;
      role?: string;
    };
  }
}
