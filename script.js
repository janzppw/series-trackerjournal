let editMode = false;
let editId = null;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Please log in first");

  const data = {
    name: document.getElementById("seriesName").value,
    episodes: document.getElementById("episodes").value,
    description: document.getElementById("description").value,
    characters: document.getElementById("characters").value,
    comment: document.getElementById("myComment").value,
    rating: document.getElementById("rating").value,
    image: document.getElementById("imageURL").value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  const seriesRef = db.collection("users").doc(user.uid).collection("series");

  if (editMode && editId) {
    // 🔁 Update existing entry
    seriesRef.doc(editId).update(data)
      .then(() => {
        alert("Series updated!");
        form.reset();
        editMode = false;
        editId = null;
        loadUserSeries(user.uid);
      });
  } else {
    // ➕ Add new entry
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    seriesRef.add(data)
      .then(() => {
        alert("Series saved!");
        form.reset();
        loadUserSeries(user.uid);
      });
  }
});

function loadUserSeries(uid) {
  const container = document.getElementById("seriesContainer");
  container.innerHTML = ""; // Clear the current list

  db.collection("users").doc(uid).collection("series")
    .orderBy("createdAt", "desc")
    .get()
ssd    .then(snapshot => {
      snapshot.forEach(doc => {
        const s = doc.data();
        const card = document.createElement("div");
        card.className = "series-card";
        card.innerHTML = `
          <img src="${s.image}" alt="${s.name}">
          <h3>${s.name}</h3>
          <p><strong>Episodes:</strong> ${s.episodes}</p>
          <p><strong>Description:</strong> ${s.description}</p>
          <p><strong>Main Characters:</strong> ${s.characters}</p>
          <p><strong>Comment:</strong> ${s.comment}</p>
          <p><strong>Rating:</strong> ${s.rating}/10</p>
          <button class="edit-btn" data-id="${doc.id}">✏️ Edit</button>
          <button class="delete-btn" data-id="${doc.id}">🗑️ Delete</button>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Error loading series:", err));
}
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    const user = auth.currentUser;
    if (!user) return;

    if (confirm("Are you sure you want to delete this entry?")) {
      db.collection("users").doc(user.uid).collection("series").doc(id).delete()
        .then(() => {
          alert("Series deleted!");
          loadUserSeries(user.uid);
        })
        .catch(err => console.error("Error deleting series:", err));
    }
  }
  if (e.target.classList.contains("edit-btn")) {
  const id = e.target.getAttribute("data-id");
  const user = auth.currentUser;
  if (!user) return;

  db.collection("users").doc(user.uid).collection("series").doc(id).get()
    .then(doc => {
      const s = doc.data();
      document.getElementById("seriesName").value = s.name;
      document.getElementById("episodes").value = s.episodes;
      document.getElementById("description").value = s.description;
      document.getElementById("characters").value = s.characters;
      document.getElementById("myComment").value = s.comment;
      document.getElementById("rating").value = s.rating;
      document.getElementById("imageURL").value = s.image;

      editMode = true;
      editId = id;

      // Scroll to top or focus on form
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

});


const authSection = document.getElementById("authSection");
const appContent = document.getElementById("addSeries");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

document.getElementById("login").onclick = () => {
  const email = emailInput.value;
  const pass = passwordInput.value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => console.log("Logged in!"))
    .catch(err => alert(err.message));
};

document.getElementById("register").onclick = () => {
  const email = emailInput.value;
  const pass = passwordInput.value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => console.log("Registered!"))
    .catch(err => alert(err.message));
};

auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = "none";
    appContent.style.display = "block";
    loadUserSeries(user.uid); // Load series for that user
  } else {
    authSection.style.display = "block";
    appContent.style.display = "none";
  }
});
