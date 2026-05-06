import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/reportes") ||
        nextUrl.pathname.startsWith("/edificios") ||
        nextUrl.pathname.startsWith("/personal") ||
        nextUrl.pathname.startsWith("/analiticas");

      if (isProtected) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.areaId = (user as { areaId?: number | null }).areaId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session.user as { areaId?: number | null }).areaId = token.areaId as number | null;
      }
      return session;
    },
  },
  providers: [],
};
