"use client";

import Link from 'next/link';

const ClassCard = ({
    key,
    authenticatedUser,
    classInfo
}: {
    key: string
    authenticatedUser: string;
    classInfo: any;         // temp; change to {classCode: string, className: string, ...}
}) => {
    const classCode = classInfo['classCode'];           // assume non-empty 
    const className = classInfo['className'];           // assume non-empty
    const creatorID = classInfo['creatorID'];           // assume non-empty 
    const location = classInfo['location'];
    const meeting = classInfo['meeting'];
    const professor = classInfo['professor'];
    const usersWithAccess = classInfo['usersWithAccess'];

    return (
        <div className="my-4 border rounded-md p-4 w-full">
            <Link
                href={`/class/${key}`}
            >
                {authenticatedUser === creatorID ? `${className} | ${classCode}` : `${creatorID} | ${className} | ${classCode}`}
            </Link>
            <hr className="mb-4 border" />
            <ul>
                <li>Location: {location}</li>
                <li>Meeting: {meeting}</li>
                <li>Professor: {professor}</li>
                <li>Users with Access: {usersWithAccess.join(', ')}</li>
            </ul>
        </div>
    );
};

export default ClassCard;
