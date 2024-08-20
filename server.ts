import { Elysia, t } from "elysia";
import html from "bun-plugin-html"

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

function getUpdateMessage(): UpdateMessage {
  return { text: currentText, connected_users: `${connectedUsers} connected users.` }
}

async function readFromFile(filePath: string): Promise<string> {
  const f = Bun.file(filePath)
  return f.text()
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

const app = new Elysia()

  .get("/", () => Bun.file("dist/index.html"))

  .ws("/text_update", {
    body: t.Object({
      text: t.String()
    }),
    message(ws, { text }) {
      currentText = text
      writeToFile(TEXT_FILE_PATH, currentText)
      ws.send(getUpdateMessage())
    },
    open(ws) {
      connectedUsers++
      console.log(`User connected. Total connected users: ${connectedUsers}`)
      ws.send(getUpdateMessage())
    },
    close(ws) {
      connectedUsers--
      console.log(`User disconnected. Total connected users: ${connectedUsers}`)
      ws.send(getUpdateMessage())
    }
  })

  .listen(SERVER_PORT)

console.log(
  `🦊 LAT is running at ${app.server?.hostname}:${app.server?.port}`
)
