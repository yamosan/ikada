<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/ikada-wordmark-dark.svg">
    <img src="public/ikada-wordmark.svg" alt="ikada" width="330">
  </picture>
</h1>

<p align="center">
  English | <a href="./README.ja.md">日本語</a>
</p>

**ikada** is a local log viewer that brings together logs from multiple commands and processes, with search and filtering. It also displays structured JSON logs in a readable format. Your logs are never sent to an external service.

<p align="center">
  <img src="https://raw.githubusercontent.com/yamosan/ikada/main/docs/assets/preview.png" alt="ikada displaying and filtering structured logs" width="1280">
</p>

## Quick Start

```bash
npx ikada
```

Install globally:

```bash
npm install -g ikada
some_command | ikada
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

## CLI Options

| Option | Default | Description |
| --- | --- | --- |
| `--host <host>` | `127.0.0.1` | Server listen host |
| `--port <number>` | `3030` | Server listen port |
| `--no-open` | `false` | Do not open the browser automatically |
| `--source <name>` | `stdin` | Label attached to ingested logs |

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

## License

MIT
