"use client";

import { FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

// if this component was mounted, user is authenticated and thus can delete their account
const ManageClassDeleteForm = ({
    classID,
    className
}: {
    classID: string;
    className: string;
}) => {
    const [message, setMessage] = useState<string>('');
    const [clicked, setClicked] = useState<boolean>(false);

    const router = useRouter();

    const deleteClass = async () => {
        const res = await fetch(`http://localhost:8000/deleteClass/${classID}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            console.error('Failed to delete class');
            setMessage('Failed to delete class');
        } else {
            router.push('/dashboard');
        }
    }

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault(); // prevent redirect on form submit 

        const form = document.getElementById('deleteClassForm') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const value = input.value;

        if (value === className) {
            deleteClass();
        } else {
            console.error('Class name does not match');
            setMessage('Class name does not match');
        }

    };

    const handleClickCheck = async () => {
        setClicked(!clicked);
        handleSubmit();
    }

    return (
        <>
            <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0">Delete Class</p>
            {
                !clicked &&
                <>
                    <div className="flex flex-col basis-1/2 grow-0">
                        <p className="text-sm sm:text-base basis-1/2 grow-0">{className}</p>
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
                        id="deleteClassForm"
                    >
                        <input
                            type="text"
                            placeholder="Type class name to confirm"
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

export default ManageClassDeleteForm;