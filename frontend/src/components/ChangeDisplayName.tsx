"use client";
import { useState, FormEvent } from 'react';

const ChangeDisplayName = ({ username }: { username: string }) => {
    const [newUsername, setNewUsername] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const response = await fetch('http://localhost:8000/changeDisplayName', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newUsername,
                username,
            }),
        });

        if (response.ok) {
            setNewUsername('');
            setMessage('Username changed successfully.');
        } else {
            setMessage('An error occurred; please try again.');
        }

    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 items-center border border-[#252525] p-4 rounded-md"
        >
            <input
                type="text"
                name="newUsername"
                id="newUsername"
                value={newUsername}
                onChange={(e) => {
                    setNewUsername(e.target.value);
                }}
                className="bg-[#252525] text-white p-2 rounded-md"
                placeholder="Enter new display name"
            />
            <button
                type="submit"
                className="mt-2 bg-[#252525] text-white rounded-md p-2 hover:opacity-50 transition-opacity"
            >
                Change display name
            </button>
            {message && <p className="mt-4 text-sm">{message}</p>}
        </form>
    );
};

export default ChangeDisplayName;