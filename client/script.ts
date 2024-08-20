const textbox = document.getElementById("textbox")! as HTMLTextAreaElement
const connectionStatus = document.getElementById("connectionStatus")!

let socket: WebSocket | null = null
let reconnectTimer: Timer | null = null

function createWebSocket() {
    // If there is an existing socket, close it before creating a new one
    if (socket) {
        socket.onclose = null; // Prevent triggering the onclose handler
        socket.close();
    }

    socket = new WebSocket("text_update")

    // Update text box and user count with data from server
    socket.onmessage = (event) => {
        let data = JSON.parse(event.data)
        textbox.value = data.text
        connectionStatus.textContent = data.connected_users
    }

    // Notify user if the connection is lost and try to reconnect
    socket.onclose = (event) => {
        if (!reconnectTimer) {
            connectionStatus.textContent = "Connection lost. The server might be offline."
            reconnectTimer = setInterval(() => {
                createWebSocket()
            }, 2000)
        }
    }

    // Clear the warning message when reconnected
    socket.onopen = (event) => {
        if (reconnectTimer) {
            clearInterval(reconnectTimer)
            reconnectTimer = null
        }

        connectionStatus.textContent = ""
    }
}

createWebSocket()

// Handle text input and emit to server
textbox.addEventListener("input", function () {
    if (!socket) {
        console.error("No open socket")
        return;
    }
    socket.send(JSON.stringify({ text: textbox.value }))
})

function fallbackCopyToClipboard() {
    textbox.focus()
    textbox.select()

    try {
        const successfulCopy = document.execCommand("copy")
    } catch (err) {
        console.error("Failed to copy text with fallback method: ", err)
    }
}

async function copyToClipboard() {
    if (!navigator.clipboard) {
        fallbackCopyToClipboard()
        return
    }
    try {
        await navigator.clipboard.writeText(textbox.value)
    } catch (err) {
        console.error("Failed to copy text: ", err)
    }
}

function clearTextbox() {
    if (!socket) {
        console.error("No open socket")
        return;
    }
    textbox.value = ""
    socket.send(JSON.stringify({ text: textbox.value }))
}
