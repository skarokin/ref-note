import UserProfile from '@/components/UserProfile';

const HeaderDashboard = ({
    username,
    pfp
}: {
    username: string;
    pfp: any;
}) => {
    return (
        <div className="flex flex-row justify-between items-center mt-4 mx-8">
            <h1
                style={{ fontFamily: 'Literata' }}
            >
                ref:note
            </h1>
            <UserProfile
                username={username} 
                pfp={pfp}
            />
        </div>
    )
}

export default HeaderDashboard;