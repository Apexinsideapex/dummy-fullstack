require "sinatra"
require "sinatra/json"
require "rack/cors"
require "sqlite3"
require "json"

set :port, ENV.fetch("PORT", 4000).to_i
set :bind, "0.0.0.0"

use Rack::Cors do
  allow do
    origins "*"
    resource "*", headers: :any, methods: [:get, :post, :options]
  end
end

DB = SQLite3::Database.new(File.expand_path("data.db", __dir__))
DB.results_as_hash = true
DB.execute_batch <<~SQL
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
SQL

helpers do
  def parse_json
    body = request.body.read
    body.empty? ? {} : (JSON.parse(body) rescue {})
  end
end

post "/login" do
  data = parse_json
  email = (data["email"] || "").strip.downcase
  halt 400, json(error: "email required") if email.empty?
  DB.execute("INSERT OR IGNORE INTO users (email) VALUES (?)", [email])
  json(ok: true, email: email)
end

get "/users" do
  rows = DB.execute("SELECT email FROM users ORDER BY created_at")
  json(users: rows.map { |r| r["email"] })
end

post "/messages" do
  data = parse_json
  to = (data["to"] || "").strip.downcase
  message = (data["message"] || "").strip
  halt 400, json(error: "to and message required") if to.empty? || message.empty?
  DB.execute("INSERT INTO messages (recipient, body) VALUES (?, ?)", [to, message])
  json(ok: true)
end

get "/messages" do
  email = (params["email"] || "").strip.downcase
  halt 400, json(error: "email required") if email.empty?
  rows = DB.execute(
    "SELECT id, body, sent_at FROM messages WHERE recipient = ? AND delivered = 0 ORDER BY id",
    [email]
  )
  unless rows.empty?
    ids = rows.map { |r| r["id"] }
    placeholders = (["?"] * ids.size).join(",")
    DB.execute("UPDATE messages SET delivered = 1 WHERE id IN (#{placeholders})", ids)
  end
  json(messages: rows.map { |r| { message: r["body"], sent_at: r["sent_at"] } })
end
