"use client";
import React from "react";
import { signIn } from "next-auth/react";

function SignInButton() {
  async function signInAction() {
    await signIn("google", {
      callbackUrl: `/consent`,
    });
  }

  return (
    <button
      className="bg-light-primary dark:bg-dark-primary px-8 py-2 text-white text-xl font-semibold rounded-xl hover:brightness-125"
      type="button" // Use type="button" for onClick handling
      onClick={() => signInAction()}
    >
      Sign in with Google
    </button>
  );
}

export default SignInButton;
