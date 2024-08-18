"use client";

import { useRouter } from 'next/navigation'; 

const ManageClass = ({
    classID,
}: {
    classID: string
}) => {
    const router = useRouter();
    
    return (
        <button
            className="hover:opacity-50 transition-opacity"
            onClick={() => router.push(`/class/${classID}/manage`)}
        >
            Manage
        </button>
            
    )
}

export default ManageClass;