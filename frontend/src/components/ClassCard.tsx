import { redirect } from 'next/navigation';

// temp; not implemented yet
const ClassCard = ({
    creatorUsername,     // only display creator if user is not the creator (we will determine this when fetching data)
    classID,             
    className,                       
    professor,                  
    location,
    meetingSchedule,
    sharedWith,
    numberNotes,
    lastUpdated,
}: {
    creatorUsername?: string,
    classID: string,
    className: string,
    professor: string,
    location: string,
    meetingSchedule: string,
    sharedWith: string[],
    numberNotes: number,
    lastUpdated: string,
}) => {

    return (
        <div className="my-4 border rounded-md p-4 w-1/2 sm:w-3/4">
            <h1
                className="text-md sm:text-lg"
                onClick={() => redirect(`/class/${classID}`)} 
            >
                {creatorUsername ? `${creatorUsername} | ${className}` : className}
            </h1>
            <hr className="mb-4 border" />
            <ul>
                <li>Professor: {professor}</li>
                <li>Location: {location}</li>
                <li>Meeting Schedule: {meetingSchedule}</li>
                <li>Shared with: {sharedWith.join(", ")}</li>
                <li>Number of notes: {numberNotes}</li>
                <li>Last updated: {lastUpdated}</li>
            </ul>
        </div>
    );
};

export default ClassCard;