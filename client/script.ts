const inputbox = document.getElementById("inputbox")! as HTMLTextAreaElement
const previewbox = document.getElementById("previewbox")! as HTMLDivElement
const connectionStatus = document.getElementById("connectionStatus")!
const checkbox = document.getElementById("edit-toggle")! as HTMLInputElement

let socket: WebSocket | null = null
let reconnectTimer: Timer | null = null
let reconnectCounter = 1

function createWebSocket() {
    // If there is an existing socket, close it before creating a new one
    if (socket) {
        socket.onclose = null // Prevent triggering the onclose handler
        if (reconnectTimer) {
            clearInterval(reconnectTimer)
            reconnectTimer = null
        }
        socket.close()
    } else {
        connectionStatus.textContent = "Connecting..."
    }

    const socketUrl = new URL("text_update", window.location.href)
    socketUrl.protocol = socketUrl.protocol.replace("http", "ws")
    socket = new WebSocket(socketUrl)

    // Update text box and user count with data from server
    socket.onmessage = (event) => {
        let data = JSON.parse(event.data)
        inputbox.value = data.text
        previewbox.innerText = data.text
        const connectedUsersMessage = `${data.connected_users} connected user${data.connected_users === 1 ? "" : "s"}.`;
        connectionStatus.textContent = connectedUsersMessage
        console.log(data.cursors)
        // TODO: Filter own cursor, show other cursors
    }

    // Notify user if the connection is lost and try to reconnect
    socket.onclose = (event) => {
        console.log("Socket closed")
        if (!reconnectTimer) {
            connectionStatus.textContent = "Connection lost. The server might be offline."
            reconnectCounter = Math.min(reconnectCounter + 1, 15)
            reconnectTimer = setInterval(() => {
                createWebSocket()
            }, reconnectCounter * 1000)
        }
    }

    // Clear the warning message when reconnected
    socket.onopen = (event) => {
        console.log("Socket opened")
        reconnectCounter = 1
        if (reconnectTimer) {
            clearInterval(reconnectTimer)
            reconnectTimer = null
        }

        connectionStatus.textContent = ""
    }
}

createWebSocket()

function handleTextInputChange() {
    if (!socket) {
        console.error("No open socket")
        return
    }
    socket.send(JSON.stringify({ text: inputbox.value, cursor: inputbox.selectionStart }))
}

function handleCursorChange(event: Event) {
    const navKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "End", "Home"]
    const navKeyPressed = event instanceof KeyboardEvent && navKeys.includes(event.key);
    const mousePressed = event instanceof PointerEvent;

    if (navKeyPressed || mousePressed) {
        if (!socket) {
            console.error("No open socket")
            return
        }
        socket.send(JSON.stringify({ text: null, cursor: inputbox.selectionStart }))
    }
}

// Handle text input and select and emit to server
inputbox.addEventListener("input", handleTextInputChange)
inputbox.addEventListener("click", handleCursorChange)
inputbox.addEventListener("keyup", handleCursorChange)

function configureInputbox() {
    inputbox.readOnly = !checkbox.checked
    inputbox.hidden = !checkbox.checked
    previewbox.hidden = checkbox.checked
}

// Handle edit checkbox toggle on page load
configureInputbox()

// Handle edit checkbox toggle
checkbox.addEventListener("change", configureInputbox)
