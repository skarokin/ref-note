"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ManageClass from '@/components/ManageClass';
import { render } from 'react-dom';

const ClassComponent = ({ username }: { username: string }) => {
    // if this component is mounted, it is assumed the user is authenticated (page.tsx)
    const [isLoading, setIsLoading] = useState(true);
    const [classData, setClassData] = useState(
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
    const [notesData, setNotesData] = useState(
        []
    );
    const params = useParams();
    const classID = params.classID as string;
    // a little hack to use async functions in a client-side component
    useEffect(() => {
        async function fetchClassData() {
            const res = await fetch("http://localhost:8000/getClass/" + classID);
            const notesRes = await fetch("http://localhost:8000/retrieveNotes/" + classID);
            setClassData(await res.json());
            console.log(notesRes);
            const notesJSON = await notesRes.json();
            console.log(notesJSON);
            setNotesData(notesJSON);
            console.log(notesData)
            setIsLoading(false);
        }

        if (classID) {
            fetchClassData();
        }
    }, [classID]);

    if (isLoading) {
        return (
            <div className="w-3/5">
                <h1>Loading...</h1>
            </div>
        );
    }

    // @ts-ignore
    if (classData.usersWithAccess.includes(username) || classData.creatorID === username) {
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
                    <ManageClass classID={classID} />
                </div>
                <hr className="border rounded-md my-2" />
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
                <hr className="border rounded-md my-2" />
                <h1 className='text-2xl font-semibold'>Notes: </h1>
                <ul className="flex flex-col w-3/5">
                    {/* notes here */}
                </ul>
            </div>
        );
    } else {
        return (
            <div className="w-3/5">
                <h1>Access Denied, contact {classData?.creatorUsername} for access.</h1>
            </div>
        );
    }
}

export default ClassComponent;