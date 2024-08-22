"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

const NoteComponent = ({
    username,
}: {
    username: string;
}) => {
    const params = useParams();
    const classID = params.classID as string;
    const noteName = params.noteName as string;

    const [error, setError] = useState<string>("");
    const [initialContent, setInitialContent] = useState<
        PartialBlock[] | undefined | "loading"
    >("loading");

    // on load, fetch note data
    useEffect(() => {
        async function fetchNoteData() {
            const res = await fetch(`http://localhost:8000/getNote/${classID}/${noteName}?username=${encodeURIComponent(username)}`);

            if (!res.ok) {
                setError("Failed to fetch note data");
                return;
            }

            const data = await res.json();
            const note = JSON.parse(data.note) as PartialBlock[];
            setInitialContent(note);

        }

        fetchNoteData();
    }, []);

    const editor = useMemo(() => {
        if (initialContent === "loading") {
          return undefined;
        }
        return BlockNoteEditor.create({ initialContent });
      }, [initialContent]);
     
    if (editor === undefined) {
        return (
            <div className="w-full self-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="w-full self-center">
            <p>{error}</p>
            <h1
                style={{ fontFamily: 'Literata' }}
                className="text-xl sm:text-3xl mb-4"
            >
                {noteName}
            </h1>
            <BlockNoteView
                editor={editor}
            />
        </div>
    );
};

export default NoteComponent;