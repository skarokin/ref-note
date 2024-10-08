"use client";

import { FormEvent, useState } from 'react';
import { handleLogout } from "@/app/actions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

// if this component was mounted, user is authenticated and thus can delete their account
const DeleteAccount = ({
    username
}: {
    username: string;
}) => {
    const [clicked, setClicked] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const deleteUser = async () => {
        const res = await fetch(`http://localhost:8000/deleteUser/${username}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            console.error('Failed to delete user');
            setMessage('Failed to delete user');
        } else {
            // implicitly redirects to homepage so no need to implement routing
            handleLogout();
        }
    }

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault(); // prevent redirect on form submit 

        // get value of deleteAccountForm
        const form = document.getElementById('deleteAccountForm') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const value = input.value;

        if (value === username) {
            deleteUser();
        } else {
            console.error('Username does not match');
            setMessage('Username does not match');
        }

    };

    const handleClickCheck = async () => {
        setClicked(!clicked);
        handleSubmit();
    }

    return (
        <>
            <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0">Delete Account</p>
            {
                !clicked &&
                <>
                    <div className="flex flex-col basis-1/2 grow-0">
                        <p className="text-sm sm:text-base basis-1/2 grow-0">{username}</p>
                        <p className="text-xs sm:text-sm text-gray-400">{message}</p>
                    </div>
                    <button
                        className="hover:text-red-500 transition-colors"
                        onClick={() => setClicked(!clicked)}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </>
            }
            {
                clicked &&
                <>
                    <form
                        className="basis-1/2 grow-0"
                        onSubmit={handleSubmit}
                        id="deleteAccountForm"
                    >
                        <input
                            type="text"
                            placeholder="Type username to confirm"
                            className="bg-[#252525] text-white rounded-md"
                        />
                    </form>
                    <button
                        className="hover:text-red-500 transition-colors"
                        onClick={handleClickCheck}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                </>
            }
        </>
    );
}

export default DeleteAccount;