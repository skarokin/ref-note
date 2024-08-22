"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import DeleteNote from '@/components/DeleteNote';

const NoteCard = ({
    classID,
    noteName,
    noteMetadata
}: {
    classID: string;
    noteName: string;
    noteMetadata: {
        createdBy: string;
        createdDate: string;
        lastUpdated: string;
    };
}) => {
    const { createdBy, createdDate, lastUpdated } = noteMetadata;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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
        <div style={{ fontFamily: 'Raleway' }} className="relative my-4 bg-[#252525] rounded-lg shadow-md p-6 w-full transition-all duration-150 hover:shadow-lg">
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-[7.5%] bottom-[70%] mt-2 w-48 bg-[#3a3a3a] shadow-lg p-2 rounded-md z-50"
                >
                    <div className="flex flex-col items-center">
                        <DeleteNote classID={classID} noteName={noteName} />
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center">
                <Link
                    href={`/class/${classID}/note/${noteName}`}
                    className="text-xl font-bold text-white hover:text-gray-300 transition-colors duration-150"
                >
                    {noteName}
                </Link>
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-400 hover:text-white transition-colors duration-150"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            </div>
            <hr className="my-4 border-[#3a3a3a]" />
            <ul className="space-y-2 text-gray-300">
                <li><span className="font-semibold text-white">Created By:</span> {createdBy}</li>
                <li><span className="font-semibold text-white">Created Date:</span> {createdDate}</li>
                <li><span className="font-semibold text-white">Last Updated:</span> {lastUpdated}</li>
            </ul>
        </div>
    );
}

export default NoteCard;