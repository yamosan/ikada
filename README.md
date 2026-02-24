# nenrin

`nenrin` is a local log viewer that ingests line-based logs from `stdin` and streams them to a browser UI using SSE.

## Requirements

- Node.js 20+
- pnpm

## Install

```bash
pnpm install
```

## Development

Run client first, then run CLI in a separate terminal.

```bash
pnpm dev:app
```

```bash
pnpm dev:cli
```

- Vite dev server runs on `http://localhost:5173`
- `/api` is proxied to `http://127.0.0.1:3030`

## Build

```bash
pnpm build
```

## Usage

### 1. Single-process mode

Start server and ingest from stdin in one command:

```bash
some_command | node dist/cli/index.js
```

### 2. Multi-process mode

Start aggregate server:

```bash
node dist/cli/index.js serve
```

Send logs from another process:

```bash
some_command | node dist/cli/index.js ingest
```

## CLI options

- `--host <host>`: server listen host (default: `127.0.0.1`)
- `--port <number>`: server listen port (default: `3030`)
- `--no-open`: do not open browser automatically
- `--source <name>`: log source name (default: `stdin`)

## API

- `POST /api/ingest`
  - Request: `{ "line": "message", "source": "stdin", "stream": "stdout" }`
  - Response: `{ "ok": true, "seq": 1 }`
- `GET /api/events?sinceSeq=<number>` (SSE)
  - `event: snapshot` with `LogEvent[]`
  - `event: append` with `LogEvent[]`

## Quick checks

```bash
echo "hello world" | node dist/cli/index.js
```

```bash
yes '{"level":"info","msg":"tick"}' | head -n 20 | node dist/cli/index.js ingest
```
