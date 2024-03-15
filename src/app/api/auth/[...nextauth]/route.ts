import { Prisma } from "@prisma/client";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../../prisma";
 
const handler = NextAuth({
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async signIn({ profile }) {
      const userInDB = await prisma.user.findUnique({
        where: {
          email: profile?.email,
        },
      });
      if (!userInDB) {
        try {
          let user = {
            email: profile?.email,
            name: profile?.name, // Optional, add if required
            picture: profile?.picture, // Optional, if available
          };
          await prisma.user.create({ data: user });
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
      return { redirect: true, status: 200, profile };
    },
  },
});

export  const { auth } = NextAuth(handler);

export { handler as GET, handler as POST };

