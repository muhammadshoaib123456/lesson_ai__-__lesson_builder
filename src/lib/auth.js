import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 days
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email || "").toLowerCase().trim();
        const password = String(creds?.password || "");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // ✅ Include firstName and lastName when returning user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          image: user.image || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ✅ When user logs in, attach all fields to the token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.firstName = user.firstName || "";
        token.lastName = user.lastName || "";
      }
      return token;
    },
    async session({ session, token }) {
      // ✅ Make sure the session has the same fields
      session.user = session.user || {};

      if (token?.id) session.user.id = token.id;
      if (token?.name) session.user.name = token.name;
      if (token?.email) session.user.email = token.email;
      if (token?.firstName) session.user.firstName = token.firstName;
      if (token?.lastName) session.user.lastName = token.lastName;

      return session;
    },
  },
};

export const { auth } = NextAuth(authOptions);
