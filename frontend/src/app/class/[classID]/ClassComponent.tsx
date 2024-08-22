"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ManageClass from '@/components/ManageClass';
import CreateNote from '@/components/CreateNote';
import NoteCard from '@/components/NoteCard';

// stupid interfaces because stupid annoying typescript errors
interface ClassData {
    classCode: string;
    className: string;
    creatorUsername: string;
    location: string;
    meeting: string;
    professor: string;
    usersWithAccess: string[];
}

interface NotesMetadata {
    [key: string]: {
        createdBy: string;
        createdDate: string;
        lastUpdated: string;
    };
}

const ClassComponent = ({ username }: { username: string }) => {
    // if this component is mounted, it is assumed the user is authenticated (page.tsx)
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [classData, setClassData] = useState<ClassData>(
        {
            classCode: "",
            className: "",
            creatorUsername: "",
            location: "",
            meeting: "",
            professor: "",
            usersWithAccess: []
        }
    );
    const [notesMetadata, setNotesMetadata] = useState<NotesMetadata>(
        {
            noteName: {
                createdBy: "",
                createdDate: "",
                lastUpdated: "",
            }
        }
    );

    const params = useParams();
    const classID = params.classID as string;

    // a little hack to use async functions in a client-side component
    useEffect(() => {
        async function fetchClassData() {
            const res = await fetch("http://localhost:8000/getClass/" + classID);

            if (!res.ok) {
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            setClassData(data['classData']);
            setNotesMetadata(data['notesMetadata']);

            setIsLoading(false);
        }

        if (classID) {
            fetchClassData();
        }
    }, [classID]);

    if (isLoading) {
        return (
            <div className="w-3/5">
                <h1 style={{ fontFamily: 'Raleway' }}
                    className="text-xl"
                >
                    Loading...
                </h1>
            </div>
        );
    }

    // @ts-ignore
    if (classData.usersWithAccess.includes(username)) {
        return (
            <div style={{ fontFamily: 'Raleway' }} className="flex flex-col w-3/5">
                <div className="flex flex-row justify-between items-end">
                    <div>
                        <h1 style={{ fontFamily: 'Literata' }}
                            className="text-xl sm:text-3xl"
                        >
                            {classData?.className}
                        </h1>
                        <h3 style={{ fontFamily: 'Literata' }}
                            className="text-lg"
                        >
                            {classData?.classCode}
                        </h3>
                    </div>
                    <ManageClass classID={classID} username={username} creatorUsername={classData.creatorUsername} />
                </div>
                <hr className="border rounded-md my-2" />
                <div>
                    <div className="flex flex-row items-center gap-4">
                        <p
                            onClick={() => setOpenDetails(!openDetails)}
                            className="font-bold hover:cursor-pointer hover:opacity-50 transition-opacity grow-0 basis-1/6"
                        >
                            {openDetails ? 'Hide' : 'More Details'}
                        </p>
                        <button
                            onClick={() => setOpenDetails(!openDetails)}
                            className="font-mono hover:cursor-pointer hover:opacity-50 transition-opacity"
                        >
                            {openDetails ? 'v' : '>'}
                        </button>
                    </div>
                    {openDetails &&
                        <div>
                            <span className="font-bold">Creator: </span><span>{classData?.creatorUsername}</span>
                            <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                Location: <span className="font-normal">{classData?.location}</span>
                            </p>
                            <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                Meeting Schedule: <span className="font-normal">{classData?.meeting}</span>
                            </p>
                            <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                Professor: <span className="font-normal">{classData?.professor}</span>
                            </p>
                            <span className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                Users with Access:&nbsp;
                            </span>
                            <ul className="inline">
                                {classData?.usersWithAccess.map((user) => {
                                    return <li key={user} className="inline">{user}</li>
                                })}
                            </ul>
                        </div>
                    }
                </div>
                <div className="flex flex-row items-center justify-between mt-16">
                    <h1 className="text-2xl font-bold">Notes</h1>
                    <CreateNote classID={classID} username={username} />
                </div>
                {notesMetadata &&
                    <ul>
                        {Object.keys(notesMetadata).map((noteName) => {
                            const noteMetadata = notesMetadata[noteName];
                            return (
                                <NoteCard
                                    key={noteName}
                                    classID={classID}
                                    noteName={noteName}
                                    noteMetadata={noteMetadata}
                                />
                            );
                        })}
                    </ul>
                }
            </div>
        );
    } else if (!classData.usersWithAccess.includes(username)) {
        // user does not have access to this class
        return (
            <div className="w-3/5">
                <h1>Access Denied, contact {classData?.creatorUsername} for access.</h1>
            </div>
        );
    } else if (!classData.classCode) {
        // class does not exist
        return (
            <div className="w-3/5">
                <h1>Something went wrong.</h1>
            </div>
        );
    }

    // default: something went wrong
    return (
        <div className="w-3/5">
            <h1>Something went wrong.</h1>
        </div>
    );

}

export default ClassComponent;