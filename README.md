# LocalAreaText (LAT)

How can I simply share text with other devices in my local network?
LAT automatically synchronizes the text you input on the site with every other device that visits the site.
It also stores the inputted text so it is not lost when you shutdown the server.
Whenever the server connection is lost, this is displayed to the user.

LAT uses [Elysia](https://elysiajs.com/) with [Bun](https://bun.sh/) on the backend.
On the frontend it has no dependencies, it just uses native WebSockets to communicate with the server.
Please note that LAT does not use TLS, so it is easy to deploy locally but do not use it for sensitive data.

## Installation

1. Make sure [Bun](https://bun.sh/) is installed or use [pnpm](https://pnpm.io/).
2. Start the required packages with:
```sh
bun install
```

## Usage

1. Start the web server with:
```sh
bun run start
```
2. Visit `SERVER_IP:5000` in your browser and replace `SERVER_IP` accordingly.
3. When you are done, you can shutdown the server with Ctrl+C.
