const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite database (file will be created automatically)
const db = new sqlite3.Database("posts.db");

app.use(express.json());
app.use(express.static("."));

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all posts
app.get("/posts", (req, res) => {
  db.all("SELECT content FROM posts ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.sendStatus(500);
    res.json(rows.map((r) => r.content));
  });
});

// Save a post
app.post("/posts", (req, res) => {
  const { content } = req.body;
  if (!content) return res.sendStatus(400);

  db.run("INSERT INTO posts (content) VALUES (?)", [content], (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
