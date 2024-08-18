import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image'
import ChangeDisplayName from '@/components/ChangeDisplayName';
import DeleteAccount from '@/components/DeleteAccount';
import Logout from '@/components/Logout';
import HeaderProfile from '@/components/HeaderProfile';
import { getDisplayName } from '@/app/actions';

// do another auth check here to see if user is authorized to make changes to their profile
const Profile = async () => {
    const session = await auth();
    // @ts-ignore
    const username = session?.user?.username;
    const displayName = await getDisplayName(username);

    if (!session?.user) {
        redirect('/unauthorized');
    }

    return (
        <>
            <HeaderProfile
                displayName={displayName}
                pfp={session?.user?.image!}
            />
            <main className="flex min-h-screen flex-col items-center justify-start p-24">
                <Image
                    src={session?.user?.image!}
                    width={100}
                    height={100}
                    alt={username}
                    className="border-4 border-[#252525] rounded-full"
                />
                <h1 style={{ fontFamily: 'Literata' }} className="text-xl mt-4 sm:text-2xl">Welcome, {displayName}</h1>
                <p style={{ fontFamily: 'Raleway' }} className="text-sm mt-4 sm:text-base">Manage your account below.</p>
                <p style={{ fontFamily: 'Raleway' }} className="text-sm sm:text-base">Username: {username} (cannot be changed)</p>
                <div className="flex flex-row gap-4 mt-16 items-center justify-between">
                    <ChangeDisplayName username={username} />
                    <DeleteAccount username={username} />
                </div>
                <a href="/dashboard" className="hover:opacity-50 transition-opacity p-3 text-sm sm:text-base">
                    Back to dashboard
                </a>
                <div className="flex flex-row items-center">
                    <p>Logout</p>
                    <Logout />
                </div>
            </main>
        </>
    )
}

export default Profile;