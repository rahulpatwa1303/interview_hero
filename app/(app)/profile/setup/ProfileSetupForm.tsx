// app/(app)/profile/setup/ProfileSetupForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // Assuming this uses createBrowserClient from @supabase/ssr
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from '@/components/icons';
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User as AuthUser } from '@supabase/supabase-js';

const techStackOptions = ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'Mobile', 'Data Science', 'Other'];

export default function ProfileSetupForm() {
  const supabase = createClient(); // Assuming this correctly gets the browser client
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [primaryTechStack, setPrimaryTechStack] = useState<string>('');
  const [programmingLanguages, setProgrammingLanguages] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingUser(true);
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      if (!currentAuthUser) {
        router.push('/login?error=User not found');
        return;
      }
      setAuthUser(currentAuthUser);

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentAuthUser.id)
        .single();

      if (profile) {
        setName(profile.name || currentAuthUser.user_metadata?.full_name || currentAuthUser.user_metadata?.name || currentAuthUser.email || '');
        setAvatarUrl(profile.avatar_url || currentAuthUser.user_metadata?.avatar_url || currentAuthUser.user_metadata?.picture || '');
        setYearsOfExperience(profile.years_of_experience?.toString() || '');
        setPrimaryTechStack(profile.primary_tech_stack || '');
        setProgrammingLanguages(profile.programming_languages?.join(', ') || '');
        setTechnologies(profile.technologies?.join(', ') || '');
        setTargetRoles(profile.target_roles?.join(', ') || '');
        setTargetCompanies(profile.target_companies?.join(', ') || '');
        setAreasOfInterest(profile.areas_of_interest?.join(', ') || '');
      } else if (error && error.code !== 'PGRST116') {
        toast("Could not load profile data.");
      } else {
        setName(currentAuthUser.user_metadata?.full_name || currentAuthUser.user_metadata?.name || currentAuthUser.email || '');
        setAvatarUrl(currentAuthUser.user_metadata?.avatar_url || currentAuthUser.user_metadata?.picture || '');
      }
      setLoadingUser(false);
    };
    fetchInitialData();

    const message = searchParams.get('message');
    if (message) {
      toast(decodeURIComponent(message));
    }
  }, [supabase, router, toast, searchParams]);

  const getInitials = (nameStr?: string | null) => {
    if (!nameStr) return authUser?.email?.[0].toUpperCase() || 'U';
    return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const parseStringToArray = (str: string): string[] => {
    if (!str || str.trim() === '') return [];
    return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- Guard clauses for authUser and authUser.email ---
    if (!authUser) {
      setFormError("User not authenticated. Please try logging in again.");
      setIsLoading(false);
      return;
    }
    if (!authUser.email) {
      setFormError("User email is not available. Cannot save profile.");
      setIsLoading(false);
      return;
    }
    // --- Now authUser and authUser.email are guaranteed to be defined ---

    setIsLoading(true);
    setFormError(null);

    if (!name.trim()) {
      setFormError("Display name cannot be empty.");
      setIsLoading(false);
      return;
    }
    const yoe = parseFloat(yearsOfExperience);
    if (isNaN(yoe) && yearsOfExperience.trim() !== '') {
      setFormError("Years of experience must be a valid number.");
      setIsLoading(false);
      return;
    }

    const commonProfileData = {
      name: name.trim(),
      avatar_url: avatarUrl || null, // Ensure null if empty
      years_of_experience: yearsOfExperience.trim() === '' ? null : yoe,
      primary_tech_stack: primaryTechStack || null, // Ensure null if empty
      programming_languages: parseStringToArray(programmingLanguages),
      technologies: parseStringToArray(technologies),
      target_roles: parseStringToArray(targetRoles),
      target_companies: parseStringToArray(targetCompanies),
      areas_of_interest: parseStringToArray(areasOfInterest),
      profile_complete: true,
    };

    // Data for the UPDATE operation
    // `id` is used in .eq(), `email` is from `authUser.email` (now string)
    const updatePayload = {
      ...commonProfileData,
      email: authUser.email, // authUser.email is string here
    };

    const { error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', authUser.id); // authUser.id is string

    if (updateError) {
      if (updateError.code === 'PGRST116') { // Row not found for update, so try to insert
        // Data for the INSERT operation
        // `id` and `email` are crucial and come from `authUser`
        const insertPayload = {
          ...commonProfileData,
          id: authUser.id,      // authUser.id is string
          email: authUser.email,  // authUser.email is string
        };
        const { error: insertError } = await supabase
          .from('users')
          .insert(insertPayload);

        if (insertError) {
          console.error('Error inserting profile:', insertError);
          setFormError(insertError.message);
          toast("Profile Creation Failed");
          setIsLoading(false);
          return;
        }
        // If insert was successful, proceed to success handling
      } else { // Other update error
        console.error('Error updating profile:', updateError);
        setFormError(updateError.message);
        toast("Profile Update Failed");
        setIsLoading(false);
        return;
      }
    }

    // If update was successful OR insert (after failed update) was successful
    setIsLoading(false);
    toast("Your profile has been successfully updated.");
    router.push('/dashboard');
    router.refresh();
  };

  if (loadingUser) {
    return <div className="flex justify-center items-center p-10"><Icons.spinner className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    // Form with natural height, centered horizontally within its container
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4"> {/* Keep original styling */}
      {formError && (
        <Alert variant="destructive">
          <Icons.warning className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center space-y-2">
        <Label>Your Avatar</Label>
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} alt="Avatar" />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Display Name <span className="text-destructive">*</span></Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email (read-only)</Label>
          <Input id="email" value={authUser?.email || ''} readOnly disabled />
        </div>
        <div className="space-y-1">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Input id="yearsOfExperience" type="number" step="0.1" min="0" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="e.g., 3.5" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="primaryTechStack">Primary Tech Stack</Label>
          <Select value={primaryTechStack} onValueChange={setPrimaryTechStack}>
            <SelectTrigger id="primaryTechStack">
              <SelectValue placeholder="Select your primary stack" />
            </SelectTrigger>
            <SelectContent className='w-full'> {/* Added w-full here, keep */}
              {techStackOptions.map(stack => (
                <SelectItem key={stack} value={stack}>{stack}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="programmingLanguages">Programming Languages (comma-separated)</Label>
        <Textarea id="programmingLanguages" value={programmingLanguages} onChange={(e) => setProgrammingLanguages(e.target.value)} placeholder="e.g., JavaScript, Python, Java" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="technologies">Technologies/Frameworks (comma-separated)</Label>
        <Textarea id="technologies" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="e.g., React, Node.js, Docker, Kubernetes" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="targetRoles">Target Roles (comma-separated)</Label>
        <Textarea id="targetRoles" value={targetRoles} onChange={(e) => setTargetRoles(e.target.value)} placeholder="e.g., Software Engineer, Staff Engineer" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="targetCompanies">Target Companies (comma-separated)</Label>
        <Textarea id="targetCompanies" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} placeholder="e.g., Google, Local Startup" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="areasOfInterest">Areas of Interest (comma-separated)</Label>
        <Textarea id="areasOfInterest" value={areasOfInterest} onChange={(e) => setAreasOfInterest(e.target.value)} placeholder="e.g., AI/ML, Distributed Systems" />
      </div>

      {/* This div contains the button */}
      <div>
        <Button type="submit" disabled={isLoading || loadingUser} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </div>
    </form>
  );
}