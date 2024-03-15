import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// import * as PlayHT from "playht";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTimeExpired(expiryTimeString: string): boolean {
  // Create Date objects for both current and expiry times
  const now = new Date();
  const expiryTime = new Date(expiryTimeString);

  // Convert to timestamps for efficient comparison
  const nowTimestamp = now.getTime();
  const expiryTimestamp = expiryTime.getTime();

  // Check if expiry time is in the past (expired)
  return expiryTimestamp < nowTimestamp;
}

// export const playHt = async () => {
//   PlayHT.init({
//     apiKey: process.env.PLAYIT_SECRET,
//     userId: process.env.PLAYIT_USER,
//     defaultVoiceId:
//       "s3://peregrine-voices/oliver_narrative2_parrot_saad/manifest.json",
//     defaultVoiceEngine: "PlayHT2.0",
//   });

//   const generated = await PlayHT.generate('Computers can speak now!');

//   return
// };
