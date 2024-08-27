#!/usr/bin/env node

const WebSocket = require('ws')
const http = require('http')
const number = require('lib0/number')
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('./utils.js').setupWSConnection

const host = process.env.HOST || 'localhost'
const port = number.parseInt(process.env.PORT || '3030')

const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', async (request, socket, head) => {
    // You may check auth of request here..
    // Call `wss.HandleUpgrade` *after* you checked whether the client has access
    // (e.g. by checking cookies, or url parameters).
    // See https://github.com/websockets/ws#client-authentication
    
    // OUR EXTENSION: auth check from URL parameters
    const urlParams = request.url.slice(1).split('/')
    const username = urlParams[0]
    const classID = urlParams[1]
    const noteName = urlParams[2]

    // check if user has access to this class
    // note that this is NOT where we get note content, but just authorizing the ws connection
    // getting initial content from db is handled on setupWSConnection in utils.js
    const res = await fetch(`http://localhost:8000/getNote/${classID}/${noteName}?username=${encodeURIComponent(username)}`)
    // if not ok, user has no access (or some other error, either way close connection)
    if (!res.ok) {
        console.log(`User ${username} has no access to class ${classID}`)
        socket.destroy()
        return
    }

    wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
        wss.emit('connection', ws, request)
    })
})

server.listen(port, host, () => {
    console.log(`running at '${host}' on port ${port}`)
})