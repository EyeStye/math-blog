const express = require("express");
const { createClient } = require("@libsql/client");
const session = require("express-session");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.use(express.json());
app.use(express.static("."));

// Enable CORS if frontend served from another origin
// Remove or adjust origin if using same domain
app.use(cors({ origin: "*", credentials: true }));

// Session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true if HTTPS
  })
);

// Ensure posts table exists
(async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table created/checked");
  } catch (err) {
    console.error("Table creation error:", err);
  }
})();

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password123") {
    req.session.user = username;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT title, content, author, created_at FROM posts ORDER BY id DESC"
    );
    const posts = (result.rows || []).map((r) => ({
      title: r[0],
      content: r[1],
      author: r[2],
      created_at: r[3],
    }));
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.sendStatus(500);
  }
});

// Save a post (only if logged in)
app.post("/posts", async (req, res) => {
  if (!req.session.user) return res.status(403).send("You must be logged in.");

  const { title, content } = req.body;
  const author = req.session.user;

  if (!title || !content) return res.sendStatus(400);

  try {
    await db.execute({
      sql: "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)",
      args: [title, content, author],
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error inserting post:", err);
    res.sendStatus(500);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
