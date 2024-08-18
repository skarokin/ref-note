"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CreateClass = ({ username }: { username: string }) => {
    const router = useRouter();
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch('http://localhost:8000/createClass', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error creating class: ${errorText}`);
            }
            
            closeForm();
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={isOpen ? 'relative' : ''}>
            <button onClick={onClick} className="text-2xl font-bold">+</button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black opacity-30 z-0"
                        onClick={closeForm}
                    ></div>
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50"
                    >
                        <div style={{ fontFamily: 'Raleway' }} className="bg-[#252525] p-6 rounded-md shadow-lg w-1/2">
                            <button onClick={closeForm}>x</button>
                            <form
                                onSubmit={handleSubmit}
                                method="post"
                                className="flex flex-col gap-2 m-4"
                            >
                                <input type="hidden" name="username" value={username} />

                                <label htmlFor="classCode">Class Code: </label>
                                <input className="rounded-md p-1" type="text" name="classCode" required={true} placeholder='(e.g. CS336) required' />

                                <label htmlFor="className">Class Name: </label>
                                <input className="rounded-md p-1" type="text" name="className" required={true} placeholder='required' />

                                <label htmlFor="professor">Professor: </label>
                                <input className="rounded-md p-1" type="text" name="professor" required={true} placeholder='required' />

                                <label htmlFor="location">Location: </label>
                                <input className="rounded-md p-1" type="text" name="location" required={true} placeholder='required' />

                                <label htmlFor="meeting">Meeting Schedule: </label>
                                <input className="rounded-md p-1" type="text" name="meeting" required={true} placeholder='(e.g. TuTh, 3:10-5:40PM) required' />

                                <div className="border rounded-xl p-2 self-center w-fit mt-4">
                                    <button type="submit" className="hover:opacity-50 transition-opacity">
                                        Create Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateClass;