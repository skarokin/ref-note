"use client";

import Link from 'next/link';

const NoteCard = ({
    key,
    classID,
    noteName,
    noteMetadata
}: {
    key: string;
    classID: string;
    noteName: string;
    noteMetadata: any;         // temp; change to {createdBy: string, createdDate: string, lastUpdated: string}
}) => {
    const createdBy = noteMetadata['createdBy'];
    const createdDate = noteMetadata['createdDate'];
    const lastUpdated = noteMetadata['lastUpdated'];

    return (
        <div style={{ fontFamily: 'Raleway' }} className="my-4 border-2 border-[#252525] rounded-md p-4 w-full">
            <Link
                href={`/class/${classID}/note/${noteName}`}
                className="text-lg font-bold hover:opacity-50 transition-opacity"
            >
                {noteName}
            </Link>
            <hr className="my-2 border border-[#252525]" />
            <ul>
                <li><span className="font-bold">Created By: </span>{createdBy}</li>
                <li><span className="font-bold">Created Date: </span>{createdDate}</li>
                <li><span className="font-bold">Last Updated: </span>{lastUpdated}</li>
            </ul>
        </div>
    );
}

export default NoteCard;