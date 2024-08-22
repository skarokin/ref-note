"use client";

import { useRouter } from 'next/navigation';

const ManageClass = ({
    classID,
    username,
    creatorUsername
}: {
    classID: string;
    username: string;
    creatorUsername: string;
}) => {
    const router = useRouter();

    const leaveClass = async () => {
        const formData = new FormData();
        formData.append("classID", classID);
        formData.append("usernameToRemove", username);

        const res = await fetch("http://localhost:8000/removeUserFromClass", {
            method: "POST",
            body: formData
        });

        if (res.status === 200) {
            router.push("/");
        }
    }

    if (username === creatorUsername) {
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