"use server";

import { signIn } from "next-auth/react";

export async function signInAction(provider: string) {
    await signIn('google')
    console.log(`Signing in with ${provider}`);
}
