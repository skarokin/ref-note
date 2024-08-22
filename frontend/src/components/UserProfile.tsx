"use client";
import Image from 'next/image';
import Link from 'next/link';
import Logout from '@/components/Logout';
import { useState, useRef, useEffect } from 'react';

const UserProfile = ({
    displayName,
    pfp
}: {
    displayName: string;
    pfp: any;
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
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

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    return (
        <div className="flex flex-col relative">
            <button
                ref={buttonRef}
                onClick={onPfpClick}
                className="border-4 border-[#252525] rounded-full"
            >
                <Image
                    src={pfp}
                    alt={displayName}
                    width={30}
                    height={30}
                    className="rounded-full"
                />
            </button>
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`flex flex-col items-center absolute top-full right-0 mt-2 w-64 bg-[#252525]
                        shadow-md p-2 rounded-md z-50 transition-all duration-150 ease-in-out
                        ${isAnimating
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-90'}`
                    }
                >
                    <Image
                        src={pfp}
                        alt={displayName}
                        width={100}
                        height={100}
                        className="rounded-full mt-4"
                    />
                    <h1
                        style={{ fontFamily: 'Raleway' }}
                        className="flex flex-row gap-2 my-4"
                    >
                        Hi, {displayName}
                    </h1>
                    <Link
                        style={{ fontFamily: 'Raleway' }}
                        href={{
                            pathname: '/profile',
                            query: { pfp }
                        }}
                        className="bg-[#3a3a3a] hover:bg-[#454545] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#454545] focus:ring-opacity-50"
                    >
                        <p>
                            Manage your account
                        </p>
                    </Link>
                    <Logout showLogout={false}/>
                </div>
            )}
        </div>
    );
};

export default UserProfile;