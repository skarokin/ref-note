"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const ChangeDisplayName = ({
    username,
    displayName,
}: {
    username: string,
    displayName: string,
}) => {
    const router = useRouter();

    const [message, setMessage] = useState<string>('');
    const [newDisplayName, setNewDisplayName] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) {
            event.preventDefault();
        }

        if (newDisplayName === "") {
            setIsEditing(false);
            return;
        }

        const response = await fetch('http://localhost:8000/changeDisplayName', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newDisplayName,
                username,
            }),
        });

        if (response.ok) {
            setNewDisplayName('');
            setIsEditing(false);
            router.refresh();
            setMessage('Display name changed successfully');
        }
    };

    const handleClickCheck = async () => {
        handleSubmit();
    }

    return (
        <>
            <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0">Display Name</p>
            {!isEditing &&
                <>
                    <div className="flex flex-col basis-1/2 grow-0">
                        <p className="text-sm sm:text-base basis-1/2 grow-0">{displayName}</p>
                        <p className="text-xs sm:text-sm text-gray-400">{message}</p>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)}>
                        <FontAwesomeIcon icon={faPen} />
                    </button>
                </>
            }
            {isEditing &&
                <>
                    <form
                        onSubmit={handleSubmit}
                        className="basis-1/2 grow-0"
                        id="displayNameForm"
                    >
                        <input
                            type="text"
                            name="newDisplayName"
                            id="newDisplayName"
                            value={newDisplayName}
                            onChange={(e) => {
                                setNewDisplayName(e.target.value);
                            }}
                            className="bg-[#252525] text-white rounded-md"
                            placeholder={displayName}
                        />
                    </form>
                    <button onClick={handleClickCheck}>
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                </>
            }
        </>
    );
};

export default ChangeDisplayName;