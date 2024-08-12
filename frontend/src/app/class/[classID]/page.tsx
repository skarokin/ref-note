import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClassComponent from './ClassComponent';

// server-side component to access session object
// pass session object to client-side component which reads [classID] from URl
const Class = async () => {
    const session = await auth();
    if (!session?.user) {
        redirect('/')
    }

    // attempts to render the client-side component; if user is not allowed then display 'Acess Denied'
    return <ClassComponent session={session} />;
}

export default Class;