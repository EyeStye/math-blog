const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const posts = document.getElementById("posts");
const postBtn = document.getElementById("postBtn");

function updatePreview() {
  preview.innerHTML = marked.parse(editor.value);
  MathJax.typesetPromise([preview]);
}

editor.addEventListener("input", updatePreview);

postBtn.addEventListener("click", () => {
  const content = editor.value.trim();
  if (!content) return;

  const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");
  savedPosts.unshift(content);
  localStorage.setItem("posts", JSON.stringify(savedPosts));

  editor.value = "";
  updatePreview();
  loadPosts();
});

function loadPosts() {
  posts.innerHTML = "";
  const savedPosts = JSON.parse(localStorage.getItem("posts") || "[]");

  savedPosts.forEach((post) => {
    const div = document.createElement("div");
    div.innerHTML = marked.parse(post);
    posts.appendChild(div);
    MathJax.typesetPromise([div]);
  });
}

updatePreview();
loadPosts();
// Handle login
document.getElementById("loginButton").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert("Login successful");
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("postForm").style.display = "block";
      document.getElementById("logoutButton").style.display = "inline-block";
    } else {
      alert("Invalid login credentials");
    }
  } catch (err) {
    console.error(err);
    alert("Error logging in");
  }
});

// Handle logout
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) {
      alert("Logged out");
      document.getElementById("loginForm").style.display = "block";
      document.getElementById("postForm").style.display = "none";
      document.getElementById("logoutButton").style.display = "none";
    }
  } catch (err) {
    console.error(err);
    alert("Error logging out");
  }
});

// Handle post submission
document.getElementById("submitPost").addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  try {
    const response = await fetch("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      alert("Post created");
      location.reload(); // Reload page to see the new post
    } else {
      alert("You must log in to create a post");
    }
  } catch (err) {
    console.error(err);
    alert("Error creating post");
  }
});
// Fetch and display posts
async function loadPosts() {
  try {
    const response = await fetch("/posts");
    const posts = await response.json();

    const postsContainer = document.getElementById("postsContainer");
    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p><strong>By:</strong> ${post.author}</p>
        <p><strong>Created:</strong> ${new Date(
          post.created_at
        ).toLocaleString()}</p>
        <div>${post.content}</div>
      `;
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error(error);
    alert("Error loading posts");
  }
}
