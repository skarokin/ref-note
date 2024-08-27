"use client";

import Link from 'next/link';
import { Session } from 'next-auth';
import { getUsername } from '@/app/actions';

const ClassCard = ({
    key,
    classID,
    session,
    classInfo
}: {
    key: string;
    classID: string;
    session: Session;
    classInfo: {
        classCode: string;
        className: string;
        creatorUsername: string;
        location: string;
        meeting: string;
        professor: string;
        usersWithAccess: string[];
    }
}) => {
    const { classCode, className, creatorUsername, location, meeting, professor, usersWithAccess } = classInfo;

    // @ts-ignore
    const authenticatedUser = getUsername(session);

    return (
        <div style={{ fontFamily: 'Raleway' }} className="my-4 bg-[#252525] rounded-lg shadow-md p-6 w-full transition-all duration-150 hover:shadow-lg">
            <Link
                href={`/class/${classID}`}
                className="text-xl font-bold text-white hover:text-gray-300 transition-colors duration-150"
            >
                {authenticatedUser === creatorUsername ? `${className} | ${classCode}` : `${creatorUsername} | ${className} | ${classCode}`}
            </Link>
            <hr className="my-4 border-[#3a3a3a]" />
            <ul className="space-y-2 text-gray-300">
                <li><span className="font-semibold text-white">Location:</span> {location}</li>
                <li><span className="font-semibold text-white">Meeting Schedule:</span> {meeting}</li>
                <li><span className="font-semibold text-white">Professor:</span> {professor}</li>
                <li><span className="font-semibold text-white">Users with Access:</span> {usersWithAccess.join(', ')}</li>
            </ul>
        </div>
    );
};

export default ClassCard;