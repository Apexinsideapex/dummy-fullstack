# Dummy Fullstack

Barebones platform used as the **starter repo for live coding interviews**. The candidate's task is to extend it into proper two-way communication (e.g. WebSockets, SSE, smarter polling — they choose). Everything below is intentionally minimal.

## What's here

```
.
├── customer/    # Static site (port 3000) — email login, alerts unread messages on refresh
├── admin/       # Static site (port 3001) — pick a user, send them a message
├── server/
│   ├── node/    # Express + better-sqlite3
│   ├── python/  # Flask + sqlite3
│   └── ruby/    # Sinatra + sqlite3
└── scripts/
    ├── customer/start
    ├── admin/start
    └── server/{node,python,ruby}/{setup,start}
```

The candidate picks one server implementation. All three expose the same HTTP API on port **4000**, backed by a local SQLite file (`server/<lang>/data.db`).

## API

| Method | Path                  | Body / Query              | Returns                                |
| ------ | --------------------- | ------------------------- | -------------------------------------- |
| POST   | `/login`              | `{ email }`               | `{ ok, email }` — upserts user        |
| GET    | `/users`              | —                         | `{ users: [email, …] }`               |
| POST   | `/messages`           | `{ to, message }`         | `{ ok }`                               |
| GET    | `/messages?email=…`   | —                         | `{ messages: [...] }` — drains unread |

## Running it

Pick a backend (`node`, `python`, or `ruby`):

```bash
# 1. install backend deps (once)
scripts/server/node/setup

# 2. open three terminals
scripts/server/node/start    # → http://localhost:4000
scripts/customer/start       # → http://localhost:3000
scripts/admin/start          # → http://localhost:3001
```

### Try it

1. Open the customer site, log in with `alice@example.com`.
2. Open the admin site, click `alice@example.com`, send a message.
3. Refresh the customer tab — message appears as a browser `alert()`.

## Prerequisites

- **Node**: `node` + `npm`
- **Python**: [`uv`](https://github.com/astral-sh/uv) (Python 3.10+)
- **Ruby**: `ruby` 3.0+ + `bundler`
- **Static sites**: `python3` (used for `python -m http.server`)

## The interview

The candidate's job is to remove the "refresh to see messages" hack and make delivery real-time, with the help of an AI coding assistant. The shape of the foundation (REST + SQLite + drain-on-read) is deliberately one-way — there is room to add a websocket, server-sent events, or smarter polling.
