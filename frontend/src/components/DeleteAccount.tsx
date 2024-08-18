"use client";

import { useState } from 'react';
import { handleLogout } from "@/app/actions";

// if this component was mounted, user is authenticated and thus can delete their account
const DeleteAccount = ({
    username
}: {
    username: string;
}) => {
    const [message, setMessage] = useState<string>('');

    return (
        <button
            className="border border-[#252525] p-4 rounded-md hover:opacity-50 transition-opacity"
            onClick={async () => {
                const res = await fetch(`http://localhost:8000/deleteUser/${username}`, {
                    method: 'DELETE'
                });
                
                if (!res.ok) {
                    setMessage('Failed to delete account');
                } else {
                    setMessage('Account deleted');
                    // implicitly redirects to homepage so no need to implement routing
                    handleLogout();
                }
            }}
        >
            Delete Account
            <p>{message}</p>
        </button>
    )
}

export default DeleteAccount;