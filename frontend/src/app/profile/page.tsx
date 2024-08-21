import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image'
import ChangeDisplayName from '@/components/ChangeDisplayName';
import DeleteAccount from '@/components/DeleteAccount';
import Logout from '@/components/Logout';
import HeaderProfile from '@/components/HeaderProfile';
import { getDisplayName } from '@/app/actions';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from '@fortawesome/free-solid-svg-icons';

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
            <main style={{ fontFamily: 'Raleway' }} className="flex flex-col items-center justify-start mt-16">
                <Image
                    src={session?.user?.image!}
                    width={100}
                    height={100}
                    alt={username}
                    className="border-4 border-[#252525] rounded-full"
                />
                <h1 style={{ fontFamily: 'Literata' }} className="text-xl mt-4 sm:text-2xl">Welcome, {displayName}</h1>
                <p className="text-sm mt-4 sm:text-base">Manage your account below.</p>
                <Logout showLogout={true} />
                <section className="flex flex-col items-center mt-16 border-2 border-[#252525] p-4 rounded-lg w-3/5">
                    <div className="flex flex-row justify-between w-full items-start">
                        <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0 opacity-50">Username</p>
                        <p className="text-sm sm:text-base basis-1/2 grow-0 opacity-50">{username}</p>
                        <FontAwesomeIcon icon={faBan} className="opacity-50" />
                    </div>
                    <hr className="w-full border border-[#252525] my-4" />
                    <div className="flex flex-row justify-between w-full items-start">
                        <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0 opacity-50">Email</p>
                        <p className="text-sm sm:text-base basis-1/2 grow-0 opacity-50">{session?.user?.email}</p>
                        <FontAwesomeIcon icon={faBan} className="opacity-50" />
                    </div>
                    <hr className="w-full border border-[#252525] my-4" />
                    <div className="flex flex-row justify-between w-full items-start">
                        <ChangeDisplayName username={username} displayName={displayName} />
                    </div>
                    <hr className="w-full border border-[#252525] my-4" />
                    <div className="flex flex-row justify-between w-full items-start">
                        <DeleteAccount username={username} />
                    </div>
                </section>
            </main>
        </>
    )
}

export default Profile;