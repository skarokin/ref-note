import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ManageComponent from './ManageComponent';
import HeaderManageClass from '@/components/HeaderManageClass';
import { getDisplayName } from '@/app/actions';

const Manage = async () => {  
    const session = await auth();
    if (!session?.user) {
        redirect('/unauthorized')
    }

    let displayName;
    if (session?.user) {
        displayName = await getDisplayName(session);
    }
    const pfp = session?.user?.image!;
    
    return (
        <>
            <HeaderManageClass
                displayName={displayName}
                pfp={pfp}
            />
            <div className="flex flex-col items-center m-16">
                <ManageComponent session={session} displayName={displayName} />
            </div>
        </>
    )
}

export default Manage;