const Y = require('yjs')
const syncProtocol = require('y-protocols/sync')
const awarenessProtocol = require('y-protocols/awareness')

const fs = require('fs')

const encoding = require('lib0/encoding')
const decoding = require('lib0/decoding')
const map = require('lib0/map')

const debounce = require('lodash.debounce')

const callbackHandler = require('./callback.js').callbackHandler
const isCallbackSet = require('./callback.js').isCallbackSet

const CALLBACK_DEBOUNCE_WAIT = parseInt(process.env.CALLBACK_DEBOUNCE_WAIT || '2000')
const CALLBACK_DEBOUNCE_MAXWAIT = parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT || '10000')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'
const persistenceDir = process.env.YPERSISTENCE
/**
 * @type {{bindState: function(string,WSSharedDoc):void, writeState:function(string,WSSharedDoc):Promise<any>, provider: any}|null}
 */
let persistence = null
if (typeof persistenceDir === 'string') {
    console.info('Persisting documents to "' + persistenceDir + '"')
    // @ts-ignore
    const LeveldbPersistence = require('y-leveldb').LeveldbPersistence
    const ldb = new LeveldbPersistence(persistenceDir)
    persistence = {
        provider: ldb,
        bindState: async (docName, ydoc) => {
            const persistedYdoc = await ldb.getYDoc(docName)
            const newUpdates = Y.encodeStateAsUpdate(ydoc)
            ldb.storeUpdate(docName, newUpdates)
            Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
            ydoc.on('update', update => {
                ldb.storeUpdate(docName, update)
            })
        },
        writeState: async (_docName, _ydoc) => { }
    }
}

/**
 * @param {{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>,provider:any}|null} persistence_
 */
exports.setPersistence = persistence_ => {
    persistence = persistence_
}

/**
 * @return {null|{bindState: function(string,WSSharedDoc):void,
  * writeState:function(string,WSSharedDoc):Promise<any>}|null} used persistence layer
  */
exports.getPersistence = () => persistence

/**
 * @type {Map<string,WSSharedDoc>}
 */
const docs = new Map()
// exporting docs so that others can use it
exports.docs = docs

const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2

/**
 * @param {Uint8Array} update
 * @param {any} _origin
 * @param {WSSharedDoc} doc
 * @param {any} _tr
 */
const updateHandler = (update, _origin, doc, _tr) => {
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeUpdate(encoder, update)
    const message = encoding.toUint8Array(encoder)
    doc.conns.forEach((_, conn) => send(doc, conn, message))
}

/**
 * @type {(ydoc: Y.Doc) => Promise<void>}
 */
let contentInitializor = _ydoc => Promise.resolve()

/**
 * This function is called once every time a Yjs document is created. You can
 * use it to pull data from an external source or initialize content.
 *
 * @param {(ydoc: Y.Doc) => Promise<void>} f
 */
exports.setContentInitializor = (f) => {
    contentInitializor = f
}

class WSSharedDoc extends Y.Doc {
    /**
     * @param {string} name
     */
    constructor(name) {
        super({ gc: gcEnabled })
        this.name = name
        /**
         * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
         * @type {Map<Object, Set<number>>}
         */
        this.conns = new Map()
        /**
         * @type {awarenessProtocol.Awareness}
         */
        this.awareness = new awarenessProtocol.Awareness(this)
        this.awareness.setLocalState(null)
        /**
         * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
         * @param {Object | null} conn Origin is the connection that made the change
         */
        const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
            const changedClients = added.concat(updated, removed)
            if (conn !== null) {
                const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(conn))
                if (connControlledIDs !== undefined) {
                    added.forEach(clientID => { connControlledIDs.add(clientID) })
                    removed.forEach(clientID => { connControlledIDs.delete(clientID) })
                }
            }
            // broadcast awareness update
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, messageAwareness)
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
            const buff = encoding.toUint8Array(encoder)
            this.conns.forEach((_, c) => {
                send(this, c, buff)
            })
        }
        this.awareness.on('update', awarenessChangeHandler)
        this.on('update', /** @type {any} */(updateHandler))
        if (isCallbackSet) {
            this.on('update', /** @type {any} */(debounce(
                callbackHandler,
                CALLBACK_DEBOUNCE_WAIT,
                { maxWait: CALLBACK_DEBOUNCE_MAXWAIT }
            )))
        }
        this.whenInitialized = contentInitializor(this)
    }
}

exports.WSSharedDoc = WSSharedDoc

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docname - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
const getYDoc = (docname, gc = true) => map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname)
    doc.gc = gc
    if (persistence !== null) {
        persistence.bindState(docname, doc)
    }
    docs.set(docname, doc)
    return doc
})

exports.getYDoc = getYDoc

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = (conn, doc, message) => {
    try {
        const encoder = encoding.createEncoder()
        const decoder = decoding.createDecoder(message)
        const messageType = decoding.readVarUint(decoder)
        switch (messageType) {
            case messageSync:
                encoding.writeVarUint(encoder, messageSync)
                syncProtocol.readSyncMessage(decoder, encoder, doc, conn)

                // If the `encoder` only contains the type of reply message and no
                // message, there is no need to send the message. When `encoder` only
                // contains the type of reply, its length is 1.
                if (encoding.length(encoder) > 1) {
                    send(doc, conn, encoding.toUint8Array(encoder))
                }
                break
            case messageAwareness: {
                awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
                break
            }
        }
    } catch (err) {
        console.error(err)
        // @ts-ignore
        doc.emit('error', [err])
    }
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {string} classID - optional, used to save doc to db
 * @param {string} noteName - optional, used to save doc to db
 */
const closeConn = async (doc, conn, classID=undefined, noteName=undefined) => {
    if (doc.conns.has(conn)) {
        /**
         * @type {Set<number>}
         */
        // @ts-ignore
        const controlledIds = doc.conns.get(conn)
        doc.conns.delete(conn)
        awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
        if (doc.conns.size === 0 && persistence !== null) {
            // if persisted, we store state and destroy ydocument
            persistence.writeState(doc.name, doc).then(() => {
                doc.destroy()
            })
            docs.delete(doc.name)
        } else if (doc.conns.size === 0) {
            // OUR EXTENSION: when last connection closes, save doc to db
            const uint8Doc = Y.encodeStateAsUpdate(doc);
            console.log('Trying to save doc to db');
            const res = await fetch('http://localhost:8000/updateNote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // no need to send username because they are already authed to access the note
                body: JSON.stringify({
                    classID: classID,
                    noteName: noteName,
                    newNoteContent: uint8Doc.toString()
                })
            });
            if (!res.ok) {
                console.log('Something went wrong saving note to db');
            }
        }
    }
    conn.close()
}

/**
 * @param {WSSharedDoc} doc
 * @param {import('ws').WebSocket} conn
 * @param {Uint8Array} m
 */
const send = (doc, conn, m) => {
    if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
        closeConn(doc, conn)
    }
    try {
        conn.send(m, {}, err => { err != null && closeConn(doc, conn) })
    } catch (e) {
        closeConn(doc, conn)
    }
}

const pingTimeout = 30000

/**
 * @param {import('ws').WebSocket} conn
 * @param {import('http').IncomingMessage} req
 * @param {any} opts
 */
exports.setupWSConnection = async (conn, req, { docName = (req.url || '').slice(1).split('?')[0], gc = true } = {}) => {
    conn.binaryType = 'arraybuffer'

    // OUR EXTENSION: docName is passed as username/classID/noteName, but we want the room name to be classID/noteName
    // so, set docName to be joined classID/noteName
    const urlParams = docName.split('/')
    const username = urlParams[0]
    const classID = urlParams[1]
    const noteName = urlParams[2]
    docName = docName.split('/').slice(1).join('/')

    // get doc, initialize if it does not exist yet
    const doc = getYDoc(docName, gc)
    doc.conns.set(conn, new Set())

    // OUR EXTENSION: if first connection to this room, initialize document w/ db content
    // other connections will just sync to this connection
    if (doc.conns.size === 1) {
        // fetch db content w/ blob content from db
        const noteFromDB = new Y.Doc();
        const res = await fetch(`http://localhost:8000/getNote/${classID}/${noteName}?username=${encodeURIComponent(username)}`);
        // if !res.ok here, its not that access is denied but some other problem
        if (!res.ok) {
            console.log('Something went wrong fetching note from db');
            closeConn(doc, conn);       // dont send clasID/noteName we dont wanna save this to db
        }

        // the note content is stored as the string representation of a Uint8Array in the db
        // so, need to convert it back to Uint8Array
        const data = await res.json()
        const noteContent = data['note'];
        // if empty, how can we initialize the doc lol so just return
        if (noteContent === '') {
            return;
        }
        // if noteContent is not in proper format, close connection and return
        if (!noteContent.includes(',')) {
            console.log('Note content from db is not a Uint8Array');
            closeConn(doc, conn, classID, noteName);
            return;
        }

        const noteContentUint8 = new Uint8Array(noteContent.split(',').map(Number));

        // Apply update to noteFromDB
        Y.applyUpdate(noteFromDB, noteContentUint8);
        // Apply noteFromB to doc
        Y.applyUpdate(doc, Y.encodeStateAsUpdate(noteFromDB));
    }

    // listen and reply to events
    conn.on('message', /** @param {ArrayBuffer} message */ message => messageListener(conn, doc, new Uint8Array(message)))

    // Check if connection is still alive
    let pongReceived = true
    const pingInterval = setInterval(() => {
        if (!pongReceived) {
            if (doc.conns.has(conn)) {
                closeConn(doc, conn, classID, noteName)
            }
            clearInterval(pingInterval)
        } else if (doc.conns.has(conn)) {
            pongReceived = false
            try {
                conn.ping()
            } catch (e) {
                closeConn(doc, conn, classID, noteName)
                clearInterval(pingInterval)
            }
        }
    }, pingTimeout)
    conn.on('close', () => {
        // no need to close awareness since closeConn does it for us
        closeConn(doc, conn, classID, noteName)
        clearInterval(pingInterval)
    })
    conn.on('pong', () => {
        pongReceived = true
    })
    // put the following in a variables in a block so the interval handlers don't keep in in
    // scope
    {
        // send sync step 1
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeSyncStep1(encoder, doc)
        send(doc, conn, encoding.toUint8Array(encoder))
        const awarenessStates = doc.awareness.getStates()
        if (awarenessStates.size > 0) {
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, messageAwareness)
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())))
            send(doc, conn, encoding.toUint8Array(encoder))
        }
    }
}