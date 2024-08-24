import { Elysia, t } from "elysia";
import html from "bun-plugin-html"
import { ServerWebSocket } from "bun";
import { ElysiaWS } from "elysia/dist/ws";

// --- Settings ---
// Path to the file where text will be saved
const TEXT_FILE_PATH = "text_data.txt"
// Port
const SERVER_PORT = 5000

let currentText = await readFromFile(TEXT_FILE_PATH)
let connectedUsers = 0

interface UpdateMessage {
  text: string;
  connected_users: string;
}

type Socket = ElysiaWS<ServerWebSocket<any>, any, any>

function getUpdateMessage(): UpdateMessage {
  const connectedUsersMessage = `${connectedUsers} connected user${connectedUsers === 1 ? "" : "s"}.`;
  return { text: currentText, connected_users: connectedUsersMessage }
}

function sendUpdateMessages(origin: Socket | null = null) {
  const message = getUpdateMessage()
  for (const ws of sockets) {
    if (ws !== origin) {
      ws.send(message)
    }
  }
}

async function readFromFile(filePath: string): Promise<string> {
  const f = Bun.file(filePath)
  if (await f.exists()) {
    return f.text()
  }
  return ""
}

async function writeToFile(filePath: string, text: string) {
  await Bun.write(filePath, text)
}

await Bun.build({
  entrypoints: ["client/index.html"],
  outdir: "dist",
  minify: true,
  plugins: [html({ inline: true })],
})

let sockets: Socket[] = []

const app = new Elysia()

  .get("/", () => Bun.file("dist/index.html"))

  .ws("/text_update", {
    body: t.Object({
      text: t.String()
    }),
    message(ws, { text }) {
      currentText = text
      sendUpdateMessages(ws)
      writeToFile(TEXT_FILE_PATH, currentText)
    },
    open(ws) {
      connectedUsers++
      console.log(`User connected. Total connected users: ${connectedUsers}`)
      sendUpdateMessages()
      sockets.push()
    },
    close(ws) {
      connectedUsers--
      console.log(`User disconnected. Total connected users: ${connectedUsers}`)
      sockets = sockets.filter(e => e !== ws)
      sendUpdateMessages()
    }
  })

  .listen(SERVER_PORT)

console.log(
  `🦊 LAT is running at ${app.server?.hostname}:${app.server?.port}`
)
