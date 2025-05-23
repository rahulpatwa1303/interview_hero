// app/(app)/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching profile:", error);
    // Handle error
    return <div>Error loading profile.</div>;
  }

  if (!profile || !profile.profile_complete) {
    return redirect('/profile/setup?message=Please complete your profile first.');
  }

  const getInitials = (name?: string | null) => {
    if (!name) return user.email?.[0].toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

  const DetailItem = ({ label, value }: { label: string; value: string | string[] | number | null | undefined }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
            {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1 mt-1">
                    {value.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
                </div>
            ) : (
                <p className="text-md">{value}</p>
            )}
        </div>
    );
  };


  return (
    <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                </div>
            </div>
            <Button asChild variant="outline">
                <Link href="/profile/setup">Edit Profile</Link>
            </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-6">
            <DetailItem label="Years of Experience" value={profile.years_of_experience?.toString()} />
            <DetailItem label="Primary Tech Stack" value={profile.primary_tech_stack} />
            <DetailItem label="Programming Languages" value={profile.programming_languages} />
            <DetailItem label="Technologies/Frameworks" value={profile.technologies} />
            <DetailItem label="Target Roles" value={profile.target_roles} />
            <DetailItem label="Target Companies" value={profile.target_companies} />
            <DetailItem label="Areas of Interest" value={profile.areas_of_interest} />
        </CardContent>
    </Card>
  );
}