// Login form
async function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    alert("Logged in successfully!");
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("postForm").style.display = "block";
    loadPosts();
  } else {
    alert("Invalid username or password");
  }
}

// Logout
async function logout() {
  await fetch("/logout", { method: "POST", credentials: "include" });
  alert("Logged out");
  location.reload();
}

// Create post
async function createPost(event) {
  event.preventDefault();
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;

  const res = await fetch("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title, content }),
  });

  if (res.ok) {
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    loadPosts();
  } else if (res.status === 403) {
    alert("You must be logged in to post");
  } else {
    alert("Error creating post");
  }
}

// Load and render posts
async function loadPosts() {
  try {
    const res = await fetch("/posts", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch posts");
    const posts = await res.json();

    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    posts.forEach((post) => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p><strong>By:</strong> ${
          post.author
        } | <strong>Created:</strong> ${new Date(
        post.created_at
      ).toLocaleString()}</p>
        <div>${post.content}</div>
      `;
      container.appendChild(div);
    });

    // Render MathJax
    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  } catch (err) {
    console.error(err);
    alert("Error loading posts");
  }
}

// Attach event listeners
document.getElementById("loginForm")?.addEventListener("submit", login);
document.getElementById("postForm")?.addEventListener("submit", createPost);
document.getElementById("logoutBtn")?.addEventListener("click", logout);

// Initial load
loadPosts();
