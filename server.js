const express = require("express");
const { createClient } = require("@libsql/client");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Use session middleware
app.use(
  session({
    secret: "your-secret-key", // Change this for production!
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true if using https in production
  })
);

app.use(express.json());
app.use(express.static("."));

// Create table if not exists
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
    console.log("✅ Table created/updated");
  } catch (err) {
    console.error("Table creation error:", err);
  }
})();

// Simple login route (no authentication library)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials (for demo purposes)
  if (username === "admin" && password === "password123") {
    req.session.user = username; // Store the username in session
    res.sendStatus(200); // Successful login
  } else {
    res.sendStatus(401); // Unauthorized
  }
});

// Logout route to clear session
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200); // Successfully logged out
  });
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await db.execute(
      "SELECT title, content, author, created_at FROM posts ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Save post (only if user is logged in)
app.post("/posts", async (req, res) => {
  if (!req.session.user) {
    return res.status(403).send("You must be logged in to post.");
  }

  const { title, content } = req.body;
  const author = req.session.user; // Use the logged-in username

  // Validate the input
  if (!title || !content) return res.sendStatus(400);

  try {
    await db.execute({
      sql: "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)",
      args: [title, content, author],
    });
    res.sendStatus(200); // Post created successfully
  } catch (err) {
    console.error(err);
    res.sendStatus(500); // Server error
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
