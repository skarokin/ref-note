import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClassCard from '@/components/ClassCard';
import DashboardGreeting from '@/components/DashboardGreeting';
import HeaderDashboard from '@/components/HeaderDashboard';
import CreateClass from '@/components/CreateClass';
import { getDisplayName } from '@/app/actions';

const Dashboard = async () => {

    const session = await auth();
    if (!session?.user) {
        redirect('/unauthorized');
    }

    // @ts-ignore
    const username = session?.user?.username;

    const res = await fetch(`http://localhost:8000/signin/${username}`);
    const data = await res.json();

    const displayName = await getDisplayName(username);

    const classData = data['classesWithAccessTo'];

    return (
        <>
            <HeaderDashboard
                displayName={displayName}
                pfp={session?.user?.image!}
            />
            <div className="flex flex-col items-center m-16">
                <DashboardGreeting displayName={displayName} />
                <div className="flex flex-row items-center justify-between w-3/5 mt-16">
                    <h1 className="text-2xl font-bold">Classes</h1>
                    <CreateClass username={username}/>
                </div>
                <ul className="flex flex-col w-3/5">
                    {Object.entries(classData).map(([classID, classInfo]) => (
                        <ClassCard
                            key={classID}
                            classID={classID} // seems redundant but key can't be used in Link href
                            authenticatedUser={username}
                            classInfo={classInfo}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
}

export default Dashboard;