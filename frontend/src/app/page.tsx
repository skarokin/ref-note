import Footer from "@/components/Footer";
import Login from "@/components/Login";
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
	// if user is already logged in, redirect to their dashboard
	const session = await auth();

	if (session?.user) {
		redirect('/dashboard');
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<h1 style={{ fontFamily: 'Literata' }} className="text-7xl p-1.5 sm:text-8xl">ref:note</h1>
			<p style={{ fontFamily: 'Raleway' }} className="text-center text-sm font-thin p-0.5 tracking-normal mb-10 sm:text-base tracking-widest">
				student-focused collaborative notes
			</p>
			<Login />
			<Footer />
		</main>
	);
}
