"use client";

import { useState, useEffect } from 'react';
import { getClassCreator, fetchClassData } from "@/app/actions";
import { useParams, useRouter } from 'next/navigation';
import ManageClassForm from '@/components/ManageClassForm';
import ManageClassDeleteForm from '@/components/ManageClassDeleteForm';
import ManageClassDeleteUserForm from '@/components/ManageClassDeleteUserForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { Session } from 'next-auth';

const ManageComponent = ({
    session,
    displayName
}: {
    session: Session;
    displayName: string;
}) => {
    const [classCreator, setClassCreator] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
            try {
                const res = await getClassCreator(session, classID);
                setClassCreator(res);
                setIsLoading(false);
            } catch (error) {
                // if error, user is not authorized to manage this class
                setIsLoading(false);
                router.push('/unauthorized');
            }
        }

        if (classID) {
            fetchClassCreator();
        }
    }, []);

    // on mount, fetch class data
    useEffect(() => {
        async function getClassData() {
            try {
                const data = await fetchClassData(session, classID);
                setClassData(data['classData']);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        if (classID) {
            getClassData();
        }
    }, []);

    if (isLoading) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }

    const changeClassCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = document.getElementById('changeClassCode') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const classCode = input.value;

        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('classCode', classCode);

        try {
            const response = await fetch('http://localhost:8000/changeClassCode', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class code: ${errorText}`);
            }

            return 'Class code changed successfully';
        } catch (error) {
            console.error('Error:', error);
            return 'Error changing class code';
        }
    }

    const changeClassName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = document.getElementById('changeClassName') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const className = input.value;

        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('className', className);

        try {
            const response = await fetch('http://localhost:8000/changeClassName', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class name: ${errorText}`);
            }

            return 'Class name changed successfully';
        } catch (error) {
            console.error('Error:', error);
            return 'Error changing class name';
        }
    }

    const changeClassLocation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = document.getElementById('changeClassLocation') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const location = input.value;

        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('location', location);

        try {
            const response = await fetch('http://localhost:8000/changeClassLocation', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class location: ${errorText}`);
            }

            return 'Class location changed successfully';
        } catch (error) {
            console.error('Error:', error);
            return 'Error changing class location';
        }
    }

    const changeClassMeetingSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = document.getElementById('changeClassMeetingSchedule') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const meeting = input.value;

        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('meeting', meeting);

        try {
            const response = await fetch('http://localhost:8000/changeClassMeetingSchedule', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class meeting schedule: ${errorText}`);
            }

            return 'Class meeting schedule changed successfully';
        } catch (error) {
            console.error('Error:', error);
            return 'Error changing class meeting schedule';
        }
    }

    const changeClassProfessor = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = document.getElementById('changeClassProfessor') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const professor = input.value;

        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('professor', professor);

        try {
            const response = await fetch('http://localhost:8000/changeClassProfessor', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error changing class professor: ${errorText}`);
            }

            return 'Class professor changed successfully';
        } catch (error) {
            console.error('Error:', error);
            return 'Error changing class professor';
        }
    }

    const addUserToClass = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = document.getElementById('addUserToClass') as HTMLFormElement;
        const input = form.querySelector('input') as HTMLInputElement;
        const username = input.value;

        const formData = new FormData();

        formData.append('classID', classID);
        formData.append('username', username);

        try {
            const response = await fetch('http://localhost:8000/addUserToClass', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error adding user to class: ${errorText}`);
            }

            return 'User added to class successfully';
        } catch (error) {
            console.error('Error:', error);
            return 'Error adding user to class';
        }
    }

    return (
        <>
            <div style={{ fontFamily: 'Raleway' }} className="flex flex-col items-center justify-start w-3/5">
                <h1
                    style={{ fontFamily: 'Literata' }}
                    className="text-xl sm:text-3xl"
                >
                    Welcome, {displayName}
                </h1>
                <p className="text-sm mt-4 sm:text-base">Manage your class below.</p>
            </div>
            <section className="flex flex-col items-center border-2 border-[#252525] mt-16 p-4 rounded-lg w-3/5">
                <div className="flex flex-row justify-between w-full items-start">
                    <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0 opacity-50">Class ID</p>
                    <p className="text-sm sm:text-base basis-1/2 grow-0 opacity-50">{classID}</p>
                    <FontAwesomeIcon icon={faBan} className="opacity-50" />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0 opacity-50">Class Creator</p>
                    <p className="text-sm sm:text-base basis-1/2 grow-0 opacity-50">{classCreator}</p>
                    <FontAwesomeIcon icon={faBan} className="opacity-50" />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassForm
                        formID="changeClassCode"
                        inputPlaceholder="Type new class code"
                        classSettingType="Class Code"
                        classSettingTypeName={classData.classCode}
                        onSubmitFunction={changeClassCode} />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassForm
                        formID="changeClassName"
                        inputPlaceholder="Type new class name"
                        classSettingType="Class Name"
                        classSettingTypeName={classData.className}
                        onSubmitFunction={changeClassName} />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassForm
                        formID="changeClassLocation"
                        inputPlaceholder="Type new class location"
                        classSettingType="Class Location"
                        classSettingTypeName={classData.location}
                        onSubmitFunction={changeClassLocation} />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassForm
                        formID="changeClassMeetingSchedule"
                        inputPlaceholder="Type new class meeting schedule"
                        classSettingType="Class Meeting Schedule"
                        classSettingTypeName={classData.meeting}
                        onSubmitFunction={changeClassMeetingSchedule} />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassForm
                        formID="changeClassProfessor"
                        inputPlaceholder="Type new class professor"
                        classSettingType="Class Professor"
                        classSettingTypeName={classData.professor}
                        onSubmitFunction={changeClassProfessor} />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassForm
                        formID="addUserToClass"
                        inputPlaceholder="Type username to add"
                        classSettingType="Users With Access"
                        classSettingTypeName={
                            <select className="bg-[#252525] text-white rounded-md">
                                {classData.usersWithAccess.map((user) => {
                                    return <option key={user} value={user}>{user}</option>;
                                })}
                            </select>
                        }
                        onSubmitFunction={addUserToClass} />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassDeleteUserForm
                        classID={classID}
                        usersWithAccess={<select className="bg-[#252525] text-white rounded-md">
                            {classData.usersWithAccess.map((user) => {
                                return <option key={user} value={user}>{user}</option>;
                            })}
                        </select>}
                    />
                </div>
                <hr className="w-full border border-[#252525] my-4" />
                <div className="flex flex-row justify-between w-full items-start">
                    <ManageClassDeleteForm
                        classID={classID}
                        className={classData.className}
                    />
                </div>
            </section>
        </>
    );
};

export default ManageComponent;