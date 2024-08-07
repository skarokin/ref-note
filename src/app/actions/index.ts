"use server"
import { signIn, signOut } from '@/auth';

export async function handleLogin(formData: FormData) {
    const action = formData.get('action')?.toString(); // provider name 
    await signIn(action, { redirectTo: "/dashboard" });
}

export async function handleLogout() {
  await signOut({ redirectTo: "/" });
}