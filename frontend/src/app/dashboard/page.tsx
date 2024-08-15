import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Logout from '@/components/Logout';

const Dashboard = async () => {

    const session = await auth();
    // @ts-ignore
    const username = session?.user?.username;

    if (!session?.user) {
        redirect('/unauthorized');
    }

    const res = await fetch(`http://localhost:8080/signin/${username}`);
    const data = await res.json();

    return (
        <div className="flex flex-col items-center m-4">
            <h1>Dashboard</h1>
            <h1>{data['userData']['username']}</h1>
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
                <input type="hidden" name="username" value={username} />
                <input type="text" name="newUsername" />
                <button type="submit">Change Username</button>
            </form>


            <form
                action="http://localhost:8080/createClass"
                method="post"
                className={
                    "flex flex-col items-center m-4"
                }
            >
                <input type="hidden" name="username" value={username} />

                <label htmlFor="classCode" >Class Code: </label>
                <input type="text" name="classCode" required={true} placeholder='required'/>

                <label htmlFor="className">Class Name: </label>
                <input type="text" name="className" required={true} placeholder='required'/>

                <label htmlFor="professor">Professor: </label>
                <input type="text" name="professor" />

                <label htmlFor="location">Location: </label>
                <input type="text" name="location" />

                <label htmlFor="meeting">Meeting: </label>
                <input type="text" name="meeting" />

                <button type="submit">Create Class</button>
            </form>
        </div>
    );
}

export default Dashboard;