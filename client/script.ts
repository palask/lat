const inputbox = document.getElementById("inputbox")! as HTMLTextAreaElement
const previewbox = document.getElementById("previewbox")! as HTMLDivElement
const connectionStatus = document.getElementById("connectionStatus")!
const checkbox = document.getElementById("edit-toggle")! as HTMLInputElement

let socket: WebSocket | null = null
let reconnectTimer: Timer | null = null

function createWebSocket() {
    // If there is an existing socket, close it before creating a new one
    if (socket) {
        socket.onclose = null // Prevent triggering the onclose handler
        socket.close()
    }

    const socketUrl = new URL("text_update", window.location.href)
    socketUrl.protocol = socketUrl.protocol.replace("http", "ws")
    socket = new WebSocket(socketUrl)

    // Update text box and user count with data from server
    socket.onmessage = (event) => {
        let data = JSON.parse(event.data)
        inputbox.value = data.text
        previewbox.innerText = data.text
        connectionStatus.textContent = data.connected_users
    }

    // Notify user if the connection is lost and try to reconnect
    socket.onclose = (event) => {
        console.log("Socket closed")
        if (!reconnectTimer) {
            connectionStatus.textContent = "Connection lost. The server might be offline."
            reconnectTimer = setInterval(() => {
                createWebSocket()
            }, 2000)
        }
    }

    // Clear the warning message when reconnected
    socket.onopen = (event) => {
        console.log("Socket opened")
        if (reconnectTimer) {
            clearInterval(reconnectTimer)
            reconnectTimer = null
        }

        connectionStatus.textContent = ""
    }
}

createWebSocket()

// Handle text input and emit to server
inputbox.addEventListener("input", function () {
    if (!socket) {
        console.error("No open socket")
        return;
    }
    socket.send(JSON.stringify({ text: inputbox.value }))
})

function configureInputbox() {
    inputbox.readOnly = !checkbox.checked
    inputbox.hidden = !checkbox.checked
    previewbox.hidden = checkbox.checked
}

// Handle edit checkbox toggle on page load
configureInputbox()

// Handle edit checkbox toggle
checkbox.addEventListener("change", function () {
    configureInputbox()
})
