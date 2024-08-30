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
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
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
            const response = await fetch(`https://ref-note-go-2hqz3n5toq-uk.a.run.app/deleteNote/${classID}/${noteName}`, {
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

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    return (
        <div>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="border-[#252525] rounded-full hover:opacity-50 transition-opacity"
            >
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Note
                </div>
            </button>
            {isOpen && (
                <>
                    <div
                        className={`fixed inset-0 bg-black z-0 transition-opacity duration-150
                                    ${isAnimating ? 'opacity-50' : 'opacity-0'}`}
                        onClick={closeForm}
                    ></div>
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 
                                    transition-all duration-150 ease-in-out
                                    ${isAnimating
                                ? 'backdrop-blur-sm backdrop-brightness-50'
                                : 'backdrop-blur-none backdrop-brightness-100'}`}
                    >
                        <div
                            style={{ fontFamily: 'Raleway' }}
                            className={`flex flex-col bg-[#252525] p-8 rounded-lg shadow-2xl w-full max-w-md
                                        transition-all duration-150 ease-in-out
                                        ${isAnimating
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-90'}`}
                        >
                            <button 
                                className="self-end text-gray-400 hover:text-gray-200 transition-colors duration-150" 
                                onClick={closeForm}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center text-white">Delete Note</h2>
                            <form
                                onSubmit={handleSubmit}
                                method="post"
                                className="flex flex-col gap-4"
                            >
                                <input type="hidden" name="classID" value={classID} />

                                <div className="flex flex-col">
                                    <label htmlFor="deleteNote" className="mb-2 font-medium text-gray-300">Type note name to confirm deletion</label>
                                    <input
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text"
                                        name="newNoteName"
                                        required={true}
                                        placeholder={noteName}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="mt-4 bg-[#3a3a3a] hover:bg-[#454545] text-white font-bold py-3 px-4 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#454545] focus:ring-opacity-50"
                                >
                                    Delete Note
                                </button>
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