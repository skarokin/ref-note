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
        <div style={{ fontFamily: 'Raleway' }} className="relative my-4 border-2 border-[#252525] rounded-md p-4 w-full">
            {isOpen && (
                <div
                ref={dropdownRef}
                className="absolute right-0 bottom-[90%] w-48 bg-[#252525] shadow-md p-2 rounded-md z-50"
              >
                    <div className="flex flex-col items-center">
                        <DeleteNote classID={classID} noteName={noteName} />
                    </div>
                </div>
            )}
            <div className="flex justify-between items-baseline">
                <Link
                    href={`/class/${classID}/note/${noteName}`}
                    className="text-lg font-bold hover:opacity-50 transition-opacity"
                >
                    {noteName}
                </Link>
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="font-mono text-xs hover:opacity-50 transition-opacity"
                >
                    ...
                </button>
            </div>
            <hr className="my-2 border border-[#252525]" />
            <ul>
                <li><span className="font-bold">Created By: </span>{createdBy}</li>
                <li><span className="font-bold">Created Date: </span>{createdDate}</li>
                <li><span className="font-bold">Last Updated: </span>{lastUpdated}</li>
            </ul>
        </div>
    );
}

export default NoteCard;