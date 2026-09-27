<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/ikada-wordmark-dark.svg">
    <img src="public/ikada-wordmark.svg" alt="ikada" width="330">
  </picture>
</h1>

<p align="center">
  A local web UI for exploring line-based logs from the command line.
</p>

**ikada** reads logs from `stdin`, streams them to a browser over SSE, and makes them easy to search, filter, and inspect without sending data to an external service.

## Quick Start

```bash
pnpm install
pnpm build

echo '{"level":"info","message":"hello"}' | node dist/cli/index.js
```

ikada starts a local server, opens the browser, and continues ingesting each line received from `stdin`.

## Usage

### Single-process mode

Start the viewer and ingest logs in one command:

```bash
some_command | ikada
```

Use `--source` to label the input stream:

```bash
some_command | ikada --source api
```

### Multi-process mode

Start a shared viewer server:

```bash
ikada serve
```

Send logs to the running server from another process:

```bash
some_command | ikada ingest --source worker
```

### Local build

Until ikada is published as a package, invoke the built CLI directly or link it globally:

```bash
node dist/cli/index.js --help
pnpm link --global
ikada --help
```

## CLI Options

| Option | Default | Description |
| --- | --- | --- |
| `--host <host>` | `127.0.0.1` | Server listen host |
| `--port <number>` | `3030` | Server listen port |
| `--no-open` | `false` | Do not open the browser automatically |
| `--source <name>` | `stdin` | Label attached to ingested logs |

## HTTP API

### Ingest a log line

```http
POST /api/ingest
```

```json
{
  "line": "message",
  "source": "stdin",
  "stream": "stdout"
}
```

The response contains the assigned sequence number:

```json
{
  "ok": true,
  "seq": 1
}
```

### Stream log events

```http
GET /api/events?sinceSeq=<number>
```

The SSE stream emits `snapshot` and `append` events containing `LogEvent[]` payloads.

## Development

Run the client and CLI in separate terminals:

```bash
pnpm dev:app
```

```bash
pnpm dev:cli
```

The Vite development server runs at `http://localhost:5173` and proxies `/api` to `http://127.0.0.1:3030`.

Useful checks:

```bash
pnpm type-check
pnpm lint
pnpm build
```

## Requirements

- Node.js 20 or later
- pnpm
