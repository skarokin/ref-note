import UserProfile from '@/components/UserProfile';

const HeaderDashboard = ({
    displayName,
    pfp
}: {
    displayName: string;
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
                displayName={displayName} 
                pfp={pfp}
            />
        </div>
    )
}

export default HeaderDashboard;