"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { createClass } from '@/app/actions';

const CreateClass = ({ session }: { session: Session }) => {
    const router = useRouter();
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

        try {
            await createClass(session, formData);
            closeForm();
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
        }
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
                            <h2 className="text-2xl font-bold mb-6 text-center text-white">Create New Class</h2>
                            <form
                                onSubmit={handleSubmit}
                                method="post"
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col">
                                    <label htmlFor="classCode" className="mb-2 font-medium text-gray-300">Class Code</label>
                                    <input 
                                        id="classCode"
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text" 
                                        name="classCode" 
                                        required={true} 
                                        placeholder='e.g. CS336'
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="className" className="mb-2 font-medium text-gray-300">Class Name</label>
                                    <input 
                                        id="className"
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text" 
                                        name="className" 
                                        required={true} 
                                        placeholder='Enter class name'
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="professor" className="mb-2 font-medium text-gray-300">Professor</label>
                                    <input 
                                        id="professor"
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text" 
                                        name="professor" 
                                        required={true} 
                                        placeholder='Enter professor name'
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="location" className="mb-2 font-medium text-gray-300">Location</label>
                                    <input 
                                        id="location"
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text" 
                                        name="location" 
                                        required={true} 
                                        placeholder='Enter class location'
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="meeting" className="mb-2 font-medium text-gray-300">Meeting Schedule</label>
                                    <input 
                                        id="meeting"
                                        className="rounded-md p-3 border border-gray-600 bg-[#3a3a3a] text-white focus:ring-2 focus:ring-[#454545] focus:border-transparent transition-all duration-150" 
                                        type="text" 
                                        name="meeting" 
                                        required={true} 
                                        placeholder='e.g. TuTh, 3:10-5:40PM'
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="mt-4 bg-[#3a3a3a] hover:bg-[#454545] text-white font-bold py-3 px-4 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#454545] focus:ring-opacity-50"
                                >
                                    Create Class
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateClass;