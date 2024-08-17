"use client";
import Image from 'next/image';
import Link from 'next/link';
import Logout from '@/components/Logout';
import { useState, useRef, useEffect } from 'react';

const UserProfile = ({
    username,
    pfp
}: {
    username: string;
    pfp: any;
}) => {
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

    const onPfpClick = () => {
        setIsOpen(prevState => !prevState);
    };

    return (
        <div className="flex flex-col relative">
            <button
                ref={buttonRef}
                onClick={onPfpClick}
                className="border-4 border-[#252525] rounded-full"
            >
                <Image
                    src={pfp}
                    alt={username}
                    width={30}
                    height={30}
                    className="rounded-full"
                />
            </button>
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="flex flex-col items-center absolute top-full right-0 mt-2 w-64 bg-[#252525] shadow-md p-2 rounded-md z-50"
                >
                    <Image
                        src={pfp}
                        alt={username}
                        width={100}
                        height={100}
                        className="rounded-full mt-4"
                    />
                    <h1
                        style={{ fontFamily: 'Raleway' }}
                        className="flex flex-row gap-2 my-4"
                    >
                        Hi, {username}
                    </h1>
                    <Link
                        style={{ fontFamily: 'Raleway' }}
                        href="/profile"
                        className="cursor-pointer border rounded-xl p-2 mb-4 text-xs sm:text-sm"
                    >
                        <p className="hover:opacity-50 transition-opacity">
                            Manage your account
                        </p>
                    </Link>
                    <Logout />
                </div>
            )}
        </div>
    );
};

export default UserProfile;