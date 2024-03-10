'use client'
import LandingPageButton from '@/components/custom/Button/LandingPage'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'

function GetStartedButton() {
    const { data: session } = useSession();

    const router = useRouter()
  
    const handleGetStarted = () => {
      
      if (session) {
        // const isExpired = isTimeExpired(session.expires);
        router.push("/get-started/introduction")
      } else {
        router.push("/api/auth/signin");
      }
    };
  return (
    <LandingPageButton title={"Get started"} onClick={handleGetStarted} />
  )
}

export default GetStartedButton