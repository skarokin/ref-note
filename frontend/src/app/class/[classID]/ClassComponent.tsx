"use client";

import { Session } from "next-auth";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ClassComponent = ({ session }: { session: Session }) => {
    // if this component is mounted, it is assumed the user is authenticated (page.tsx)
    const username: string = session?.user?.username;

    const [classData, setClassData] = useState(
        {
            className: "",
            creatorID: "",
            location: "",
            meeting: "",
            professor: "",
            usersWithAccess: []
        }
    );

    const params = useParams();
    const classID = params.classID as string;

    useEffect(() => {
        async function fetchClassData() {
            const res = await fetch("http://localhost:8080/getClass/" + classID);
            setClassData(await res.json());
            console.log(classData);
        }

        if (classID) {
            fetchClassData();
        }
    }, [classID]);

    if (!classID) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        )
    }

    if (classData.usersWithAccess.includes(username) || classData.creatorID === username) {
        return (
            <div>
                <h1>{classData?.className}</h1>
                <p>{classData?.creatorID}</p>
                <p>{classData?.location}</p>
                <p>{classData?.meeting}</p>
                <p>{classData?.professor}</p>
                <ul>
                    {classData?.usersWithAccess.map((user) => {
                        return <li key={user}>{user}</li>
                    })}
                </ul>
            </div>
        );
    }

    return (
        <div>
            <h1>Access Denied, contact {classData?.creatorID} for access.</h1>
        </div>
    )
}

export default ClassComponent;