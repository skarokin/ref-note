"use client";

const DashboardGreeting = ({
    username
}: {
    username: string
}) => {
    const currentTime = new Date().getHours();
    const timeOfDay = currentTime < 12 ? 'morning' : currentTime < 18 ? 'afternoon' : 'evening';
    return (
        <h1 
            style={{ fontFamily: 'Literata' }}
            className="text-xl sm:text-3xl">
            Good {timeOfDay}, {username}
        </h1>
    );
}

export default DashboardGreeting;