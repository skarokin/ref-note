"use client";

import Link from 'next/link';

const ClassCard = ({
    key,
    classID,
    authenticatedUser,
    classInfo
}: {
    key: string;
    classID: string;       
    authenticatedUser: string;
    classInfo: any;         // temp; change to {classCode: string, className: string, ...}
}) => {
    const classCode = classInfo['classCode'];           // assume non-empty 
    const className = classInfo['className'];           // assume non-empty
    const creatorUsername = classInfo['creatorUsername'];           // assume non-empty 
    const location = classInfo['location'];
    const meeting = classInfo['meeting'];
    const professor = classInfo['professor'];
    const usersWithAccess = classInfo['usersWithAccess'];

    return (
        <div style={{ fontFamily: 'Raleway' }} className="my-4 border-2 border-[#252525] rounded-md p-4 w-full">
            <Link
                href={`/class/${classID}`}
                className="text-lg font-bold hover:opacity-50 transition-opacity"
            >
                {authenticatedUser === creatorUsername ? `${className} | ${classCode}` : `${creatorUsername} | ${className} | ${classCode}`}
            </Link>
            <hr className="my-2 border border-[#252525]" />
            <ul>
                <li><span className="font-bold">Location: </span>{location}</li>
                <li><span className="font-bold">Meeting Schedule: </span>{meeting}</li>
                <li><span className="font-bold">Professor: </span>{professor}</li>
                <li><span className="font-bold">Users with Access: </span>{usersWithAccess.join(', ')}</li>
            </ul>
        </div>
    );
};

export default ClassCard;
