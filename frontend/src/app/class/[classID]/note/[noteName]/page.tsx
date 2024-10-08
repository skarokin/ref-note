import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDisplayName } from '@/app/actions';
import HeaderManageClass from '@/components/HeaderManageClass';

// this is necessary to avoid a build error
// see https://github.com/yjs/yjs/issues/438#issuecomment-1271063127
import dynamic from 'next/dynamic';

const Note = async () => {
    const session = await auth();
    if (!session?.user) {
        redirect('/unauthorized')
    }

    let displayName;
    if (session?.user) {
        displayName = await getDisplayName(session);
    }
    const pfp = session?.user?.image!;

    const NoteComponent = dynamic(() => import('./NoteComponent'), {
        ssr: false,
    });

    if (session?.user) {
        return (
            <>
                {/* HeaderManageClass has same content required by Note so why bother making a new component */}
                <HeaderManageClass
                    displayName={displayName}
                    pfp={pfp}
                />
                <div className="flex flex-col items-center m-16">
                    <NoteComponent session={session} />
                </div>
            </>
        )
    }
}

export default Note;