const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 4000;
const db = new Database('data.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    body TEXT NOT NULL,
    delivered INTEGER NOT NULL DEFAULT 0,
    sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email required' });
  db.prepare('INSERT OR IGNORE INTO users (email) VALUES (?)').run(email);
  res.json({ ok: true, email });
});

app.get('/users', (_req, res) => {
  const rows = db.prepare('SELECT email FROM users ORDER BY created_at').all();
  res.json({ users: rows.map((r) => r.email) });
});

app.post('/messages', (req, res) => {
  const to = (req.body?.to || '').trim().toLowerCase();
  const message = (req.body?.message || '').trim();
  if (!to || !message) return res.status(400).json({ error: 'to and message required' });
  db.prepare('INSERT INTO messages (recipient, body) VALUES (?, ?)').run(to, message);
  res.json({ ok: true });
});

app.get('/messages', (req, res) => {
  const email = (req.query.email || '').toString().trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email required' });
  const rows = db
    .prepare('SELECT id, body, sent_at FROM messages WHERE recipient = ? AND delivered = 0 ORDER BY id')
    .all(email);
  if (rows.length) {
    const ids = rows.map((r) => r.id);
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE messages SET delivered = 1 WHERE id IN (${placeholders})`).run(...ids);
  }
  res.json({ messages: rows.map((r) => ({ message: r.body, sent_at: r.sent_at })) });
});

app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
