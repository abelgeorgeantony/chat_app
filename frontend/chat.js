function goBackToList() {
  document.getElementById("chat-view").classList.remove("active");
  document.getElementById("chat-list").classList.remove("hidden");
}

function openChatWith(userId, userName) {
  document.getElementById("chat-title").textContent = userName;
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("chat-list").classList.add("hidden");

  // Later: Load messages for userId
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

