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

export async function getDisplayName(session: Session) {
    // @ts-ignore
    const username = session?.user?.username;
    const res = await fetch("http://localhost:8000/getDisplayName/" + username);
    if (!res.ok) {
        throw new Error("Failed to fetch display name");
    }

    const data = await res.json();
    return data['displayName'];
}

export async function getClassCreator(session: Session, classID: string) {
    // @ts-ignore
    const username = session?.user?.username;
    const res = await fetch("http://localhost:8000/getClassCreator/" + classID);
    const creatorUsername = await res.json();
    if (username != creatorUsername) {
        throw new Error("User does not have access to this class");
    }
    return creatorUsername;
}

// dashboard page
export async function signInDashboard(session: Session) {
    // @ts-ignore
    const username = session?.user?.username;
    const res = await fetch(`http://localhost:8000/signin/${username}`);
    if (!res.ok) {
        throw new Error("Failed to sign in");
    }
    const data = await res.json();
    return data['classesWithAccessTo'];
}  

// create class (in dashboard)
export async function createClass(session: Session, formData: FormData) {
    // @ts-ignore
    const username = session?.user?.username;
    formData.append("username", username);
    const res = await fetch("http://localhost:8000/createClass", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Failed to create class");
    }
}

export async function getUsername(session: Session) {
    // @ts-ignore
    return session?.user?.username;
}

export async function fetchClassData(session: Session, classID: string) {
    // @ts-ignore
    const username = session?.user?.username;
    const res = await fetch(`http://localhost:8000/getClass/${classID}/${username}`);
    if (!res.ok) {
        throw new Error("Failed to fetch class data or user does not have access");
    }
    const data = await res.json();
    return data;
}

export async function createNote(session: Session, formData: FormData) {
    // @ts-ignore
    const username = session?.user?.username;
    formData.append("username", username);
    const res = await fetch("http://localhost:8000/createNote", {
        method: "POST",
        body: formData,
    });
    
    if (!res.ok) {
        throw new Error("Failed to create note");
    }
}