"use server";
import React from "react";
import SignInButton from "./signInButton";

async function SignIn() {
  return (
    <div className="bg-light-background dark:bg-dark-background h-screen flex w-screen justify-evenly items-center capitalize">
      <div className="px-8 py-6 bg-light-card dark:bg-dark-card rounded-2xl flex flex-col gap-6">
        <h1 className="text-4xl text-light-main dark:text-dark-main">
          Sign In
        </h1>
        <section className="flex flex-col gap-2">
          <h4 className="text-md text-light-main dark:text-dark-main">
            sign in to activate account
          </h4>
          <SignInButton />
        </section>
      </div>
    </div>
  );
}

export default SignIn;
