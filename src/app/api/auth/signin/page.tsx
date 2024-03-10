"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

function Login() {
  const handleLogin = async () => {
    const loginResp = await signIn("google",{ callbackUrl: '/get-started' });
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center text-light-onSurface dark:text-dark-onSurface">
      <div className=" p-6 rounded-lg flex justify-center items-center flex-col bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest shadow-lg drop-shadow-md">
        <h3 className="text-3xl">Log in to interviewHero</h3>
        <div className="mt-4">
          <Button
            variant="outline"
            className="rounded-full border-gray-500 capitalize text-md flex flex-row gap-2"
            onClick={handleLogin}
          >
            <FcGoogle /> sign in with gooogle
          </Button>
        </div>

        <div className="mt-6">
          No account?{" "}
          <Link href={"new-user"} className="text-sky-600">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
