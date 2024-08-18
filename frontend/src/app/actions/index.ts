"use server"
import { signIn, signOut } from '@/auth';

export async function handleLogin(formData: FormData) {
    const action = formData.get('action')?.toString(); 
    await signIn(action, { redirectTo: `/dashboard` });
}

export async function handleLogout() {
  await signOut({ redirectTo: "/" });
}

export async function getDisplayName(username: string) {
    const res = await fetch("http://localhost:8000/getDisplayName/" + username);
    if (!res.ok) {
        throw new Error("Failed to fetch display name");
    }

    const data = await res.json();
    return data['displayName'];
}

export async function getClassCreator(classID: string) {
    const res = await fetch("http://localhost:8000/getClassCreator/" + classID);
    const data = await res.json();
    return data as string;
}