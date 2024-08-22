import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDisplayName } from '@/app/actions';
import HeaderManageClass from '@/components/HeaderManageClass';

// this is necessary to avoid a build error
// see https://github.com/yjs/yjs/issues/438#issuecomment-1271063127
import dynamic from 'next/dynamic';
export const NoteComponent = dynamic(() => import('./NoteComponent'), {
  ssr: false,
});

const Note = async () => {
    const session = await auth();
    if (!session?.user) {
        redirect('/unauthorized')
    }

    // @ts-ignore
    const username = session?.user?.username!;

    // @ts-ignore
    const displayName = await getDisplayName(session?.user?.username!);
    const pfp = session?.user?.image!;

    return (
        <>
            {/* HeaderManageClass has same content required by Note so why bother making a new component */}
            <HeaderManageClass
                displayName={displayName}
                pfp={pfp}
            />
            <div className="flex flex-col items-center m-16">
                <NoteComponent username={username} />
            </div>
        </>
    )
}

export default Note;