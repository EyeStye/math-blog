const express = require("express");
const { createClient } = require("@libsql/client");

const app = express();
const PORT = process.env.PORT || 3000;

// Turso client (no native SQLite)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.use(express.json());
app.use(express.static("."));

// Create table
(async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// Get posts
app.get("/posts", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT content FROM posts ORDER BY id DESC"
    );
    res.json(result.rows.map((r) => r.content));
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Save post
app.post("/posts", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.sendStatus(400);

  try {
    await db.execute({
      sql: "INSERT INTO posts (content) VALUES (?)",
      args: [content],
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
