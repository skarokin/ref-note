import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClassComponent from './ClassComponent';
import HeaderClass from '@/components/HeaderClass';
import { getDisplayName } from '@/app/actions';

// server-side component to access session object
// pass session object to client-side component which reads [classID] from URl
const Class = async () => {
    const session = await auth();
    if (!session?.user) {
        redirect('/unauthorized')
    }
    
    // @ts-ignore
    let displayName;
    if (session?.user) {
        displayName = await getDisplayName(session);
    }
    
    const pfp = session?.user?.image!;

    // attempts to render the client-side component; if user is not allowed then display 'Acess Denied'
    return (
        <>
            <HeaderClass
                displayName={displayName}
                pfp={pfp}
            />
            <div className="flex flex-col items-center m-16">
                <ClassComponent session={session} />
            </div>
        </>
    );
}

export default Class;