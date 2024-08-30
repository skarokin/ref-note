"use client";

import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';

const ManageClass = ({
    classID,
    session,
    creatorUsername
}: {
    classID: string;
    session: Session;
    creatorUsername: string;
}) => {
    const router = useRouter();

    const leaveClass = async () => {
        const formData = new FormData();
        formData.append("classID", classID);
        // @ts-ignore
        formData.append("usernameToRemove", session.user.username);

        const res = await fetch("https://ref-note-go-2hqz3n5toq-uk.a.run.app/removeUserFromClass", {
            method: "POST",
            body: formData
        });

        if (res.status === 200) {
            router.push("/");
        }
    }

    // @ts-ignore
    if (session.user.username === creatorUsername) {
        return (
            <button
                className="hover:opacity-50 transition-opacity"
                onClick={() => router.push(`/class/${classID}/manage`)}
            >
                Manage
            </button>

        )
    }

    return (
        <button
            className="hover:opacity-50 transition-opacity"
            onClick={leaveClass}
        >
            Leave Class
        </button>
    )
}

export default ManageClass;