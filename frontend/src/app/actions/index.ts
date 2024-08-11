"use server"
import { signIn, signOut, auth } from '@/auth';

export async function handleLogin(formData: FormData) {
    const action = formData.get('action')?.toString(); 
    const session = await auth();
    const username = session?.user?.email?.replace('@gmail.com', '');
    // since this is just a fun little project it assumes that the only domain possible is gmail.com
    await signIn(action, { redirectTo: `/user/${username}` });
}

export async function handleLogout() {
  await signOut({ redirectTo: "/" });
}