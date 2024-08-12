"use server"
import { signIn, signOut } from '@/auth';
import { Session } from 'next-auth';

export async function handleLogin(formData: FormData) {
    const action = formData.get('action')?.toString(); 
    await signIn(action, { redirectTo: `/dashboard` });
}

export async function handleLogout() {
  await signOut({ redirectTo: "/" });
}

export async function loadClass(session: Session | null, classID: string | null) {
  const username = session?.user?.username;
  
  const res = await fetch(`http://localhost:8080/getClass/${classID}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  const classInfo = await res.json();

  for (const user of classInfo.usersWithAccess) {
    if (user === username) {
      return classInfo;
    }
  }

  return null;
}