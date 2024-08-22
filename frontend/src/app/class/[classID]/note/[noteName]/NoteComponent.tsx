"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const NoteComponent = ({
    username,
}: {
    username: string;
}) => {
    const params = useParams();
    const classID = params.classID as string;
    const noteName = params.noteName as string;

    const [error, setError] = useState<string>("");
    const [noteContent, setNoteContent] = useState<string>("");

    // on load, fetch note data
    useEffect(() => {
        async function fetchNoteData() {
            const res = await fetch(`http://localhost:8000/getNote/${classID}/${noteName}?username=${encodeURIComponent(username)}`);

            if (!res.ok) {
                setError("Failed to fetch note data");
                return;
            }

            const data = await res.json();
            setNoteContent(data["note"]);
        }

        fetchNoteData();
    }, []);

    return (
        <div>
            <h1>{noteName}</h1>
            <p>{noteContent}</p>
            <p>{error}</p>
        </div>
    );
};

export default NoteComponent;