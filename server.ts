import { Elysia, t } from "elysia";
import html from "bun-plugin-html"
import { ServerWebSocket } from "bun";
import { ElysiaWS } from "elysia/dist/ws";

// --- Settings ---
// Path to the file where text will be saved
const TEXT_FILE_PATH = "text_data.txt"
// Port
const SERVER_PORT = 5000

class FileHandler {
  constructor(private path: string) { }

  async readFromFile(): Promise<string> {
    const f = Bun.file(this.path)
    if (await f.exists()) {
      return f.text()
    }
    return ""
  }

  async writeToFile(text: string) {
    await Bun.write(this.path, text)
  }
}

interface UpdateMessage {
  text: string;
  connected_users: number;
  cursors: object;
}

class MessageHandler {
  private static getUpdateMessage(): UpdateMessage {
    return { text: state.currentText, connected_users: state.connectedUsers, cursors: Object.fromEntries(state.cursors) }
  }

  static sendUpdateMessages(origin: Socket | null = null) {
    const message = this.getUpdateMessage()
    for (const ws of state.sockets) {
      if (!origin || getSocketId(ws) !== getSocketId(origin)) {
        ws.send(message)
      }
    }
  }
}

type Socket = ElysiaWS<ServerWebSocket<any>, any, any>

const fileHandler = new FileHandler(TEXT_FILE_PATH)

let state = {
  currentText: await fileHandler.readFromFile(),
  connectedUsers: 0,
  cursors: new Map<string, number>(),
  sockets: [] as Socket[]
}

function getSocketId(ws: Socket): string {
  return ws.raw.data.id
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
      text: t.Nullable(t.String()),
      cursor: t.Number()
    }),

    message(ws, { text, cursor }) {
      if (text !== null) {
        state.currentText = text
      }
      state.cursors.set(getSocketId(ws), cursor)
      MessageHandler.sendUpdateMessages(ws)
      fileHandler.writeToFile(state.currentText)
    },

    open(ws) {
      state.connectedUsers++
      state.sockets.push(ws)
      MessageHandler.sendUpdateMessages()
      console.log(`User connected. Total connected users: ${state.connectedUsers}`)
    },

    close(ws) {
      state.connectedUsers--
      state.sockets = state.sockets.filter(e => getSocketId(e) !== getSocketId(ws))
      state.cursors.delete(getSocketId(ws))
      MessageHandler.sendUpdateMessages()
      console.log(`User disconnected. Total connected users: ${state.connectedUsers}`)
    }
  })

  .listen(SERVER_PORT)

console.log(
  `🦊 LAT is running at ${app.server?.hostname}:${app.server?.port}`
)
