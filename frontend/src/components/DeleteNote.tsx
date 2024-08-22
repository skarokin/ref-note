"use client";

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const DeleteNote = ({
    classID,
    noteName,
}: {
    classID: string;
    noteName: string;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const closeForm = () => setIsOpen(false);

    // if user presses escape key, close form
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        if (formData.get('newNoteName') !== noteName) {
            setMessage('Note name does not match');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/deleteNote/${classID}/${noteName}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                setMessage(errorText);
            } else {
                closeForm();
                window.location.reload();
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="border-4 border-[#252525] rounded-full hover:opacity-50 transition-opacity"
            >
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Note
                </div>
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-0"
                        onClick={closeForm}
                    ></div>
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm backdrop-brightness-50"
                    >
                        <div style={{ fontFamily: 'Raleway' }} className="flex flex-col bg-[#252525] p-6 rounded-md shadow-lg w-1/2">
                            <button className="self-end hover:opacity-50 transition-opacity" onClick={closeForm}>x</button>
                            <form
                                onSubmit={handleSubmit}
                                method="post"
                                className="flex flex-col gap-2 m-4"
                            >
                                <input type="hidden" name="classID" value={classID} />

                                <label htmlFor="Delete Note">Type note name to confirm deletion</label>
                                <input className="rounded-md p-1" type="text" name="newNoteName" required={true} placeholder={noteName} />

                                <div className="border rounded-xl p-2 self-center w-fit mt-4">
                                    <button type="submit" className="hover:opacity-50 transition-opacity">
                                        Delete Note
                                    </button>
                                </div>
                            </form>
                            <p className="text-red-500">{message}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeleteNote;