"use client";

import Link from 'next/link';
import UserProfile from '@/components/UserProfile';

const HeaderProfile = ({
    displayName,
    pfp
}: {
    displayName: string;
    pfp: any;
}) => {
    return (
        <div className="flex flex-row justify-between items-center mt-4 mx-8">
            <Link
                style={{ fontFamily: 'Literata' }}
                href="/dashboard"
                className="hover:opacity-50 transition-opacity"
            >
                back to dashboard
            </Link>
            <UserProfile
                displayName={displayName}
                pfp={pfp}
            />
        </div>
    )
}

export default HeaderProfile;