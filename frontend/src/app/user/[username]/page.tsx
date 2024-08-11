import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Logout from '@/components/Logout';

const Dashboard = async () => {

    const session = await auth();
    const username = session?.user?.email?.replace('@gmail.com', '');

    if (!session?.user) {
        redirect('/');
    }

    // TODO: if session username !== url username, redirect to session username
    // PROBLEM: can only access url on client-side components, but this HAS to be server-side

    // send user id and name to backend (name only to generate default username if doesnt exist)
    const res = await fetch(`http://localhost:8080/signin/${username}`);
    const data = await res.json();

    return (
        <div className="flex flex-col items-center m-4">
            <h1>Dashboard</h1>
            <h1>{data['userData']['name']}</h1>
            <p>classes with access to:</p>
            <ul>
            {Object.entries(data['classesWithAccessTo']).map(([classID, classDetails]) => (
                <li key={classID}>{classID}: {JSON.stringify(classDetails)}</li>
            ))}
            </ul>
            <Image 
                src={session?.user?.image!} 
                alt={session?.user?.name!}
                width={100}
                height={100}
            />
            <Logout />
            <form
                action="http://localhost:8080/changeUsername"
                method="post"
            >
                <input type="hidden" name="userID" value={username} />
                <input type="text" name="newUsername" />
                <button type="submit">Change Username</button>
            </form>
        </div>
    );
}

export default Dashboard;