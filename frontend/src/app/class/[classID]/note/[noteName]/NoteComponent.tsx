"use client"

import { useParams } from 'next/navigation';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Session } from 'next-auth';

const NoteComponent = ({
    session,
}: {
    session: Session;
}) => {
    const params = useParams();
    const classID = params.classID as string;
    const noteName = params.noteName as string;

    // @ts-ignore
    const username = session.user.username;

    const doc = new Y.Doc();
    // setup a yjs provider 
    const provider = new WebsocketProvider(`ws://localhost:3030`, `${username}/${classID}/${noteName}`, doc);
    provider.on('status', (event: { status: any; }) => {
        console.log(event.status) // logs "connected" or "disconnected"
    })

    // ws server handles setting initial content, so we don't need to do anything other than
    // connect to the provider and set up a blocknote editor
    const editor = useCreateBlockNote({
        collaboration: {
            // The Yjs Provider responsible for transporting updates:
            provider,
            // Where to store BlockNote data in the Y.Doc:
            fragment: doc.getXmlFragment("document-store"),
            // Information (name and color) for this user:
            user: {
                name: username,
                // random color for user (i just copy pasted this from stackoverflow lol)
                color: "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})
            },
        },
    });

    return (
        <div className="w-full self-center">
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