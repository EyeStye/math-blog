const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure /data directory exists
const DATA_DIR = "/data";
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// SQLite database path
const dbPath = path.join(DATA_DIR, "posts.db");

// Open SQLite with explicit error handling
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ SQLite open error:", err.message);
  } else {
    console.log("✅ SQLite connected:", dbPath);
  }
});

app.use(express.json());
app.use(express.static("."));

// Create table safely AFTER open
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Get all posts
app.get("/posts", (req, res) => {
  db.all("SELECT content FROM posts ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    res.json(rows.map((r) => r.content));
  });
});

// Save a post
app.post("/posts", (req, res) => {
  const { content } = req.body;
  if (!content) return res.sendStatus(400);

  db.run("INSERT INTO posts (content) VALUES (?)", [content], (err) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
