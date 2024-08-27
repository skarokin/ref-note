"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ManageClass from '@/components/ManageClass';
import CreateNote from '@/components/CreateNote';
import NoteCard from '@/components/NoteCard';
import { Session } from 'next-auth';
import { fetchClassData } from '@/app/actions';

// stupid interfaces because stupid annoying typescript errors
interface ClassData {
    classCode: string;
    className: string;
    creatorUsername: string;
    location: string;
    meeting: string;
    professor: string;
    usersWithAccess: string[];
}

interface NotesMetadata {
    [key: string]: {
        createdBy: string;
        createdDate: string;
        lastUpdated: string;
    };
}

const ClassComponent = ({ session }: { session: Session }) => {
    // if this component is mounted, it is assumed the user is authenticated (page.tsx)
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(true);
    const [classData, setClassData] = useState<ClassData>(
        {
            classCode: "",
            className: "",
            creatorUsername: "",
            location: "",
            meeting: "",
            professor: "",
            usersWithAccess: []
        }
    );
    const [notesMetadata, setNotesMetadata] = useState<NotesMetadata>(
        {
            noteName: {
                createdBy: "",
                createdDate: "",
                lastUpdated: "",
            }
        }
    );

    const params = useParams();
    const classID = params.classID as string;

    // a little hack to use async functions in a client-side component
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchClassData(session, classID);
                setClassData(data.classData);
                setNotesMetadata(data.notesMetadata);
                setError(false);
            } catch (error) {
                // if error is caught then user does not have access (or something went wrong)
                console.error(error);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (classID) {
            fetchData();
        }
    }, [classID]);

    if (isLoading) {
        return (
            <div className="w-3/5">
                <h1 style={{ fontFamily: 'Raleway' }}
                    className="text-xl"
                >
                    Loading...
                </h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-3/5">
                <h1>Access Denied, contact {classData?.creatorUsername} for access.</h1>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'Raleway' }} className="flex flex-col w-3/5">
               <div className="relative my-4 bg-[#252525] rounded-lg shadow-md p-6 w-full transition-all duration-150 hover:shadow-lg">
                   <div className="flex justify-between items-end">
                       <div>
                           <h1 style={{ fontFamily: 'Literata' }}
                               className="text-xl sm:text-3xl"
                           >
                               {classData?.className}
                           </h1>
                           <h3 style={{ fontFamily: 'Literata' }}
                               className="text-lg"
                           >
                               {classData?.classCode}
                           </h3>
                       </div>
                       <ManageClass classID={classID} session={session} creatorUsername={classData.creatorUsername} />
                   </div>
                   <hr className="my-4 border-[#3a3a3a]" />
                   <div>
                       <div className="flex flex-row items-center justify-between">
                           <p
                               onClick={() => setOpenDetails(!openDetails)}
                               className="font-bold hover:cursor-pointer hover:opacity-50 transition-opacity basis-1/4"
                           >
                               {openDetails ? 'Hide' : 'More Details'}
                           </p>
                           <button
                               onClick={() => setOpenDetails(!openDetails)}
                               className="font-mono hover:cursor-pointer hover:opacity-50 transition-opacity"
                           >
                               {openDetails ? 'v' : '>'}
                           </button>
                       </div>
                       {openDetails &&
                           <div>
                               <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                   Creator: <span className="font-normal">{classData?.creatorUsername}</span>
                               </p>
                               <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                   Location: <span className="font-normal">{classData?.location}</span>
                               </p>
                               <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                   Meeting Schedule: <span className="font-normal">{classData?.meeting}</span>
                               </p>
                               <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                   Professor: <span className="font-normal">{classData?.professor}</span>
                               </p>
                               <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                                   Users with Access:&nbsp;
                                   <span className="font-normal">
                                       {classData?.usersWithAccess.join(', ')}
                                   </span>
                               </p>
                           </div>
                       }
                   </div>
               </div>
               <div className="flex flex-row items-center justify-between mt-16">
                   <h1 className="text-2xl font-bold">Notes</h1>
                   <CreateNote classID={classID} session={session} />
               </div>
               {notesMetadata &&
                   <ul className="flex flex-col">
                       {Object.keys(notesMetadata).map((noteName) => {
                           const noteMetadata = notesMetadata[noteName];
                           return (
                               <NoteCard
                                   key={noteName}
                                   classID={classID}
                                   noteName={noteName}
                                   noteMetadata={noteMetadata}
                               />
                           );
                       })}
                   </ul>
               }
           </div>
    )

}

export default ClassComponent;