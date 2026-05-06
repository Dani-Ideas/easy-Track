import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      areaId?: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    areaId?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    areaId?: number | null;
  }
}
