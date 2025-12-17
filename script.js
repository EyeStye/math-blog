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
