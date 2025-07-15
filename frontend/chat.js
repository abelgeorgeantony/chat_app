// Dummy contacts
const dummyContacts = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Davis" }
];

// Load contacts into sidebar
function loadContacts() {
  const list = document.getElementById("user-list");
  list.innerHTML = ""; // Clear old list

  dummyContacts.forEach(user => {
    const contactDiv = document.createElement("div");
    contactDiv.classList.add("contact-card");

    contactDiv.innerHTML = `
      <div class="contact-avatar">${user.name.charAt(0)}</div>
      <div class="contact-info">
        <div class="contact-name">${user.name}</div>
        <div class="contact-lastmsg">Tap to chat</div>
      </div>
    `;

    // Click → open chat
    contactDiv.onclick = () => openChatWith(user.id, user.name);

    list.appendChild(contactDiv);
  });

}

function goToProfile() {
  window.location.href = "profile.html";
}

function goBackToList() {
  document.getElementById("chat-view").classList.remove("active");
  document.getElementById("chat-list").classList.remove("hidden");
}

function openChatWith(userId, userName) {
  document.getElementById("chat-title").textContent = userName;
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("chat-list").classList.add("hidden");

  // Later: Load messages for userId
  document.getElementById("messages").innerHTML = "<p><em>Loading chat with ${userName}...</em></p>";
}

function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const message = input.value.trim();
  if (!message) return;

  // Append locally
  const div = document.createElement("div");
  div.textContent = message;
  document.getElementById("messages").appendChild(div);

  input.value = "";
  // Later: Send message via WebSocket or fetch
}


document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  loadContacts();
});
