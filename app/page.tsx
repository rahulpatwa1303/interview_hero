import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to My Supabase App!</h1>
      {user ? (
        <p>
          You are logged in. Go to your <Link href="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>.
        </p>
      ) : (
        <p>
          Please <Link href="/login" className="text-blue-500 hover:underline">Login</Link> to continue.
        </p>
      )}
    </div>
  );
}