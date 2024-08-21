"use client";

import Link from 'next/link';
import UserProfile from '@/components/UserProfile';
import { useParams } from 'next/navigation';

const HeaderManageClass = ({
    displayName,
    pfp
}: {
    displayName: string;
    pfp: any;
}) => {
    const classID = useParams().classID as string;
    const redirect = `/class/${classID}`;
    return (
        <div className="flex flex-row justify-between items-center mt-4 mx-8">
            <Link
                style={{ fontFamily: 'Literata' }}
                href={redirect}
                className="hover:opacity-50 transition-opacity"
            >
                back to class
            </Link>
            <UserProfile
                displayName={displayName} 
                pfp={pfp}
            />
        </div>
    )
}

export default HeaderManageClass;