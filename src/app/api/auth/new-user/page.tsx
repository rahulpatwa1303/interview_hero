"use client";

import React from "react";
import { useSession, signIn, signOut,  } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

function Register() {
  const handleLogin = async () => {
    const loginResp = await signIn("google");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="border border-gray-300 p-6 rounded-lg flex justify-center items-center flex-col">
        <h3 className="text-3xl">Join InterviewHero.</h3>
        <div className="mt-4">
          <Button
            variant="outline"
            className="rounded-full border-gray-500 capitalize text-md flex flex-row gap-2"
            onClick={handleLogin}
          >
            <FcGoogle /> sign up with gooogle
          </Button>
        </div>

        <div className="mt-6">
          Already have an account?{" "}
          <Link href={"signin"} className="text-sky-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
