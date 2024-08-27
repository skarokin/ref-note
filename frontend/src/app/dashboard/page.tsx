import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClassCard from '@/components/ClassCard';
import DashboardGreeting from '@/components/DashboardGreeting';
import HeaderDashboard from '@/components/HeaderDashboard';
import CreateClass from '@/components/CreateClass';
import { getDisplayName, signInDashboard } from '@/app/actions';

const Dashboard = async () => {

    const session = await auth();
    if (!session?.user) {
        redirect('/unauthorized');
    }

    let classData;

    try {
        classData = await signInDashboard(session);
    } catch (error) {
        console.error(error);
        redirect('/unauthorized');
    }
    
    let displayName;
    if (session?.user) {
        displayName = await getDisplayName(session);
    }

    return (
        <>
            <HeaderDashboard
                displayName={displayName}
                pfp={session?.user?.image!}
            />
            <div className="flex flex-col items-center m-16">
                <DashboardGreeting displayName={displayName} />
                <div
                    style={{ fontFamily: 'Raleway' }}
                    className="flex flex-row items-center justify-between w-3/5 mt-16"
                >
                    <h1 className="text-2xl font-bold">Classes</h1>
                    <CreateClass session={session} />
                </div>
                <ul className="flex flex-col w-3/5">
                    {Object.entries(classData).map(([classID, classInfo]) => (
                        <ClassCard
                            key={classID}
                            classID={classID} // seems redundant but key can't be used in Link href
                            session={session}
                            classInfo={classInfo as { classCode: string; className: string; creatorUsername: string; location: string; meeting: string; professor: string; usersWithAccess: string[]; }}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
}

export default Dashboard;