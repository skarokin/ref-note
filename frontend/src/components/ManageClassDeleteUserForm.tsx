"use client";

import { FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

// if this component was mounted, user is authenticated and thus can delete their account
const ManageClassDeleteUserForm = ({
    classID,
    usersWithAccess,
}: {
    classID: string;
    usersWithAccess: JSX.Element;
}) => {
    const [message, setMessage] = useState<string>('');
    const [clicked, setClicked] = useState<boolean>(false);

    const deleteUser = async (usernameToRemove: string) => {
        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('usernameToRemove', usernameToRemove);

        const res = await fetch('https://ref-note-go-2hqz3n5toq-uk.a.run.app/removeUserFromClass', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            console.error('Failed to remove user');
            setMessage('Failed to remove user');
        } else {
            setMessage('User removed successfully');
        }
    }

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault(); // prevent redirect on form submit 

        const form = document.getElementById('deleteUserFromClassForm') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const value = input.value;

        deleteUser(value);

    };

    const handleClickCheck = async () => {
        setClicked(!clicked);
        handleSubmit();
    }

    return (
        <>
            <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0">Remove User Access</p>
            {
                !clicked &&
                <>
                    <div className="flex flex-col basis-1/2 grow-0">
                        <p className="text-sm sm:text-base basis-1/2 grow-0">{usersWithAccess}</p>
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
                        id="deleteUserFromClassForm"
                    >
                        <input
                            type="text"
                            placeholder="Type a username to remove"
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

export default ManageClassDeleteUserForm;