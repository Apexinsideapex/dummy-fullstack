import os
import sqlite3
from flask import Flask, request, jsonify, g
from flask_cors import CORS

DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")
PORT = int(os.environ.get("PORT", 4000))

app = Flask(__name__)
CORS(app)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    con = sqlite3.connect(DB_PATH)
    con.executescript(
        """
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
        """
    )
    con.commit()
    con.close()


@app.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify(error="email required"), 400
    db = get_db()
    db.execute("INSERT OR IGNORE INTO users (email) VALUES (?)", (email,))
    db.commit()
    return jsonify(ok=True, email=email)


@app.get("/users")
def list_users():
    db = get_db()
    rows = db.execute("SELECT email FROM users ORDER BY created_at").fetchall()
    return jsonify(users=[r["email"] for r in rows])


@app.post("/messages")
def send_message():
    data = request.get_json(silent=True) or {}
    to = (data.get("to") or "").strip().lower()
    message = (data.get("message") or "").strip()
    if not to or not message:
        return jsonify(error="to and message required"), 400
    db = get_db()
    db.execute("INSERT INTO messages (recipient, body) VALUES (?, ?)", (to, message))
    db.commit()
    return jsonify(ok=True)


@app.get("/messages")
def fetch_messages():
    email = (request.args.get("email") or "").strip().lower()
    if not email:
        return jsonify(error="email required"), 400
    db = get_db()
    rows = db.execute(
        "SELECT id, body, sent_at FROM messages WHERE recipient = ? AND delivered = 0 ORDER BY id",
        (email,),
    ).fetchall()
    if rows:
        ids = [r["id"] for r in rows]
        placeholders = ",".join("?" * len(ids))
        db.execute(f"UPDATE messages SET delivered = 1 WHERE id IN ({placeholders})", ids)
        db.commit()
    return jsonify(messages=[{"message": r["body"], "sent_at": r["sent_at"]} for r in rows])


if __name__ == "__main__":
    init_db()
    print(f"Python server listening on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
