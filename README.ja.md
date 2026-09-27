<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/ikada-wordmark-dark.svg">
    <img src="public/ikada-wordmark.svg" alt="ikada" width="330">
  </picture>
</h1>

<p align="center">
  <a href="./README.md">English</a> | 日本語
</p>

**ikada**は、複数のコマンドやプロセスから流れるログをローカル上で集約し、検索・フィルタリングできるログビューアーです。JSON形式の構造化ログも読みやすく表示します。ログが外部サービスへ送信されることはありません。

## クイックスタート

```bash
npx ikada
```

グローバルにインストール:

```bash
npm install -g ikada
some_command | ikada
```

ikadaはローカルサーバーを起動してブラウザを開き、`stdin`から受け取った各行を継続的に取り込みます。

## 使い方

### シングルプロセスモード

1つのコマンドでビューアーを起動し、ログを取り込みます。

```bash
some_command | ikada
```

入力元を区別するには`--source`を指定します。

```bash
some_command | ikada --source api
```

### マルチプロセスモード

共有ビューアーサーバーを起動します。

```bash
ikada serve
```

別のプロセスから、起動済みのサーバーへログを送信します。

```bash
some_command | ikada ingest --source worker
```

## CLIオプション

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `--host <host>` | `127.0.0.1` | サーバーが待ち受けるホスト |
| `--port <number>` | `3030` | サーバーが待ち受けるポート |
| `--no-open` | `false` | ブラウザを自動で開かない |
| `--source <name>` | `stdin` | 取り込んだログに付与する入力元の名前 |

## 開発

クライアントとCLIを別々のターミナルで起動します。

```bash
pnpm dev:app
```

```bash
pnpm dev:cli
```

Vite開発サーバーは`http://localhost:5173`で起動し、`/api`を`http://127.0.0.1:3030`へプロキシします。

主なチェックコマンド:

```bash
pnpm type-check
pnpm lint
pnpm build
```

## 動作要件

- Node.js 20以降
- pnpm

## ライセンス

MIT
