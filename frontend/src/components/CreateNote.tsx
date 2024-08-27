"use client";

import { Session } from 'next-auth';
import { useState, useEffect } from 'react';
import { createNote } from '@/app/actions';

const CreateNote = ({
    classID,
    session
}: {
    classID: string;
    session: Session;
}) => {
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const onClick = () => {
        setIsOpen(!isOpen);
    };

    const closeForm = () => {
        setIsOpen(false);
    };

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

        const noteName = formData.get('noteName') as string;
        if (noteName.includes(' ')) {
            setMessage('Note name cannot contain spaces');
            return;
        }

        try {
            await createNote(session, formData);
            closeForm();
            window.location.reload();
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        }

        // try {
        //     const response = await fetch('http://localhost:8000/createNote', {
        //         method: 'POST',
        //         body: formData,
        //     });

        //     if (!response.ok) {
        //         const errorText = await response.text();
        //         setMessage(errorText);
        //     } else {
        //         closeForm();
        //         window.location.reload();
        //     }
        // } catch (error) {
        //     console.error('Error:', error);
        // }
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    return (
        <div className={isOpen ? 'relative' : ''}>
            <button 
                onClick={onClick} 
                className="bg-[#252525] hover:bg-[#3a3a3a] text-white rounded-full w-10 h-10 flex items-center justify-center text-3xl transition-colors duration-150"
            >
                +
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
                            <h2 className="text-2xl font-bold mb-6 text-center text-white">Create New Note</h2>
                            <form
                                onSubmit={handleSubmit}
                                method="post"
                                className="flex flex-col gap-4"
                            >
                                <input type="hidden" name="classID" value={classID} />

                                <div className="flex flex-col">
                                    <label htmlFor="noteName" className="mb-2 font-medium text-gray-300">Note Name</label>
                                    <input 
                                        id="noteName"
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text" 
                                        name="noteName" 
                                        required={true} 
                                        placeholder='Enter note name' 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="mt-4 bg-[#3a3a3a] hover:bg-[#454545] text-white font-bold py-3 px-4 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#454545] focus:ring-opacity-50"
                                >
                                    Create Note
                                </button>
                            </form>
                            {message && <p className="mt-4 text-red-400 text-center">{message}</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateNote;