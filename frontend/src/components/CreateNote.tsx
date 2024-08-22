"use client";

import { useState, useEffect } from 'react';

const CreateNote = ({
    classID,
    username
}: {
    classID: string;
    username: string;
}) => {
    
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const onClick = () => {
        setIsOpen(!isOpen);
    };

    const closeForm = () => {
        setIsOpen(false);
    };

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

    // temp: createNote endpoint not implemented yet 
    // if this component was mounted, user has access to class so no need for further auth check
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
            const response = await fetch('http://localhost:8000/createNote', {
                method: 'POST',
                body: formData,
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

    return (
        <div className={isOpen ? 'relative' : ''}>
            <button onClick={onClick} className="text-2xl font-bold hover:opacity-50 transition-opacity">+</button>
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
                                <input type="hidden" name="username" value={username} />

                                <label htmlFor="Note Name">Note Name: </label>
                                <input className="rounded-md p-1" type="text" name="noteName" required={true} placeholder='required' />

                                <div className="border rounded-xl p-2 self-center w-fit mt-4">
                                    <button type="submit" className="hover:opacity-50 transition-opacity">
                                        Create Note
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

export default CreateNote;