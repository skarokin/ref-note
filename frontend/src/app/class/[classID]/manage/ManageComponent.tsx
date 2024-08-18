"use client";

import { useState, useEffect } from 'react';
import { getClassCreator } from "@/app/actions";
import { useParams, useRouter } from 'next/navigation';

const ManageComponent = ({
    username,
}: {
    username: string;
}) => {
    const [classCreator, setClassCreator] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [messageChangeClassCode, setMessageChangeClassCode] = useState<string>("");
    const [messageChangeClassName, setMessageChangeClassName] = useState<string>("");
    const [messageChangeClassLocation, setMessageChangeClassLocation] = useState<string>("");
    const [messageChangeClassMeetingSchedule, setMessageChangeClassMeetingSchedule] = useState<string>("");
    const [messageChangeClassProfessor, setMessageChangeClassProfessor] = useState<string>("");
    const [messageAddUserToClass, setMessageAddUserToClass] = useState<string>("");

    const router = useRouter();
    const params = useParams();
    const classID = params.classID as string;

    const [classData, setClassData] = useState({
        classCode: "",
        className: "",
        creatorUsername: "",
        location: "",
        meeting: "",
        professor: "",
        usersWithAccess: []
    });

    // a little hack to use async functions in a client-side component
    // on mount, fetch class creator
    useEffect(() => {
        async function fetchClassCreator() {
            const res = await getClassCreator(classID);
            setClassCreator(res);
            setIsLoading(false);
        }

        if (classID) {
            fetchClassCreator();
        }
    }, []);

    // on mount, fetch class data
    useEffect(() => {
        async function fetchClassData() {
            const res = await fetch("http://localhost:8000/getClass/" + classID);
            setClassData(await res.json());
        }

        if (classID) {
            fetchClassData();
        }
    }, []);

    // necessary; otherwise would always see 'unauthorized' since classCreator is initially empty
    useEffect(() => {
        if (!isLoading && classCreator !== username) {
            router.push('/unauthorized');
        }
    }, [isLoading, classCreator, username]);

    if (isLoading) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }

    const changeClassCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        formData.append('classID', classID);

        try {
            const response = await fetch('http://localhost:8000/changeClassCode', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class code: ${errorText}`);
            }

            setMessageChangeClassCode('Class code changed successfully');
            router.refresh();
        } catch (error) {
            setMessageChangeClassCode('Error changing class code');
            console.error('Error:', error);
        }
    }

    const changeClassName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        formData.append('classID', classID);

        try {
            const response = await fetch('http://localhost:8000/changeClassName', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class name: ${errorText}`);
            }

            setMessageChangeClassName('Class name changed successfully');
            router.refresh();
        } catch (error) {
            setMessageChangeClassName('Error changing class name');
            console.error('Error:', error);
        }
    }

    const changeClassLocation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        formData.append('classID', classID);

        try {
            const response = await fetch('http://localhost:8000/changeClassLocation', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class location: ${errorText}`);
            }

            setMessageChangeClassLocation('Class location changed successfully');
            router.refresh();
        } catch (error) {
            setMessageChangeClassLocation('Error changing class location');
            console.error('Error:', error);
        }
    }

    const changeClassMeetingSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        formData.append('classID', classID);

        try {
            const response = await fetch('http://localhost:8000/changeClassMeetingSchedule', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class meeting schedule: ${errorText}`);
            }

            setMessageChangeClassMeetingSchedule('Class meeting schedule changed successfully');
            router.refresh();
        } catch (error) {
            setMessageChangeClassMeetingSchedule('Error changing class meeting schedule');
            console.error('Error:', error);
        }
    }

    const changeClassProfessor = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        formData.append('classID', classID);

        try {
            const response = await fetch('http://localhost:8000/changeClassProfessor', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class professor: ${errorText}`);
            }

            setMessageChangeClassProfessor('Class professor changed successfully');
            router.refresh();
        } catch (error) {
            setMessageChangeClassProfessor('Error changing class professor');
            console.error('Error:', error);
        }
    }

    const addUserToClass = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        formData.append('classID', classID);

        try {
            const response = await fetch('http://localhost:8000/addUserToClass', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error adding user to class: ${errorText}`);
            }

            setMessageAddUserToClass('User added to class successfully');
            router.refresh();
        } catch (error) {
            setMessageAddUserToClass('Error adding user to class');
            console.error('Error:', error);
        }
    }

    const deleteClass = async () => {
        try {
            const response = await fetch(`http://localhost:8000/deleteClass/${classID}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error deleting class: ${errorText}`);
            }

            router.push('/dashboard');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div style={{ fontFamily: 'Raleway' }} className="flex flex-col w-3/5 ">
            <h1
                style={{ fontFamily: 'Literata' }}
                className="text-xl sm:text-3xl"
            >
                Class Settings
            </h1>
            <p>Class ID: {classID}</p>
            <hr className="border rounded-md my-2" />
            <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between items-start border border-[#252525] p-4 rounded-md">
                    <form
                        className="flex flex-col gap-2 items-start grow"
                        onSubmit={changeClassCode}
                    >
                        <label>Change class code</label>
                        <input className="bg-[#252525] text-white p-2 rounded-md w-3/4" type="text" name="classCode" id="classCode" />
                        <button
                            className="hover:opacity-50 transition-opacity"
                        >
                            Submit
                        </button>
                        <p>{messageChangeClassCode}</p>
                    </form>
                    <p className="text-sm w-1/6 text-left">{classData.classCode}</p>
                </div>
                <div className="flex flex-row justify-between items-start border border-[#252525] p-4 rounded-md">
                    <form
                        className="flex flex-col gap-2 items-start grow"
                        onSubmit={changeClassName}
                    >
                        <label>Change class name</label>
                        <input className="bg-[#252525] text-white p-2 rounded-md w-3/4" type="text" name="className" id="className" />
                        <button
                            className="hover:opacity-50 transition-opacity"
                        >
                            Submit
                        </button>
                        <p>{messageChangeClassName}</p>
                    </form>
                    <p className="text-sm w-1/6 text-left">{classData.className}</p>
                </div>
                <div className="flex flex-row justify-between items-start border border-[#252525] p-4 rounded-md">
                    <form
                        className="flex flex-col gap-2 items-start grow"
                        onSubmit={changeClassLocation}
                    >
                        <label>Change class location</label>
                        <input className="bg-[#252525] text-white p-2 rounded-md w-3/4" type="text" name="location" id="location" />
                        <button
                            className="hover:opacity-50 transition-opacity"
                        >
                            Submit
                        </button>
                        <p>{messageChangeClassLocation}</p>
                    </form>
                    <p className="text-sm w-1/6 text-left">{classData.location}</p>
                </div>
                <div className="flex flex-row justify-between items-start border border-[#252525] p-4 rounded-md">
                    <form
                        className="flex flex-col gap-2 items-start grow"
                        onSubmit={changeClassMeetingSchedule}
                    >
                        <label>Change class meeting schedule</label>
                        <input className="bg-[#252525] text-white p-2 rounded-md w-3/4" type="text" name="meeting" id="meeting" />
                        <button
                            className="hover:opacity-50 transition-opacity"
                        >
                            Submit
                        </button>
                        <p>{messageChangeClassMeetingSchedule}</p>
                    </form>
                    <p className="text-sm w-1/6 text-left">{classData.meeting}</p>
                </div>
                <div className="flex flex-row justify-between items-start border border-[#252525] p-4 rounded-md">
                    <form
                        className="flex flex-col gap-2 items-start grow"
                        onSubmit={changeClassProfessor}
                    >
                        <label>Change class professor</label>
                        <input className="bg-[#252525] text-white p-2 rounded-md w-3/4" type="text" name="professor" id="professor" />
                        <button
                            className="hover:opacity-50 transition-opacity"
                        >
                            Submit
                        </button>
                        <p>{messageChangeClassProfessor}</p>
                    </form>
                    <p className="text-sm w-1/6">{classData.professor}</p>
                </div>
                <div className="flex flex-row justify-between items-start border border-[#252525] p-4 rounded-md">
                    <form
                        className="flex flex-col gap-2 items-start grow"
                        onSubmit={addUserToClass}
                    >
                        <label>Add user to class</label>
                        <input className="bg-[#252525] text-white p-2 rounded-md w-3/4" type="text" name="username" id="username" />
                        <button
                            className="hover:opacity-50 transition-opacity"
                        >
                            Submit
                        </button>
                        <p>{messageAddUserToClass}</p>
                    </form>
                    <select className="text-sm w-1/6 text-left bg-[#252525] text-white p-2 rounded-md">
                        {classData.usersWithAccess.map((user) => {
                            return <option key={user} value={user}>{user}</option>
                        })}
                    </select>
                </div>
            </div>
            <div className="cursor-pointer border border-[#252525] rounded-xl p-2 w-fit self-center mt-4">
                <button
                    className="hover:opacity-50 transition-opacity text-red-400"
                    onClick={deleteClass} // assume user is creator if they can access this component
                >
                    DANGER: Delete Class (cannot be undone)
                </button>
            </div>
        </div>
    );
};

export default ManageComponent;