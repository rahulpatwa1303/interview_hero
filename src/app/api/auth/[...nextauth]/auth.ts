import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AdapterUser } from "next-auth/adapters";
import prisma from "../../../../../prisma";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
      authorization: {
        params: {
          access_type: "offline",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signIn",
  },
  callbacks: {
    async signIn({
      profile,
    }: {
      profile?: any | AdapterUser;
    }): Promise<string | boolean> {
      const isUser = await prisma.user.findUnique({
        where: {
          email: profile?.email,
        },
      });
      if (!isUser) {
        try {
          let user = {
            email: profile?.email,
            name: profile?.name,
          };
          await prisma.user.create({ data: user });
        } catch (err) {
          console.log(err);
        }
      }
      return true;
    },
  },
};

export default authOptions;
