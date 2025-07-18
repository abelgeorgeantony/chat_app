let ws;

// Load contacts into sidebar
async function loadContacts() {
  const token = getCookie("auth_token");
  const res = await fetch(API + "fetch_contacts.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });

  const data = await res.json();
  if (!data.valid) {
    console.error("Invalid token when fetching contacts");
    return;
  }

  const list = document.getElementById("user-list");
  list.innerHTML = ""; // Clear old list

  data.contacts.forEach(contact => {
    const contactDiv = document.createElement("div");
    contactDiv.classList.add("contact-card");

    contactDiv.innerHTML = `
      <div class="contact-avatar">${contact.name.charAt(0)}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-lastmsg">Tap to chat</div>
      </div>
    `;

    // Click → open chat
    contactDiv.onclick = () => openChatWith(contact.id, contact.name);

    list.appendChild(contactDiv);
  });

}

function showAddContactForm() {
  document.getElementById("add-contact-form").style.display = "block";
}

function hideAddContactForm() {
  document.getElementById("add-contact-form").style.display = "none";
  document.getElementById("new-contact-username").value = "";
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
  document.getElementById("send-button").onclick = () => sendMessage(userId);

  // Later: Load messages for userId
  document.getElementById("messages").innerHTML = "<p><em>Loading chat with ${userName}...</em></p>";
}



function connectWebSocket() {
  const token = getCookie("auth_token");
  if (!token) {
    console.error("No auth token, not connecting WS");
    return;
  }

  ws = new WebSocket("ws://localhost:8080");

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
    ws.send(JSON.stringify({
      type: "register",
      token: token
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "message") {
      displayIncomingMessage(data.from, data.message);
    }
  };

  ws.onclose = () => console.log("❌ WebSocket disconnected");
  ws.onerror = (err) => console.error("WS Error:", err);
}

function sendMessage(contactId) {
	console.log(contactId);
  const input = document.getElementById("message-input");
  const message = input.value.trim();
  if (!message) return;
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("❌ WebSocket not open yet!");
    return;
  }

  // Append locally
  const div = document.createElement("div");
  div.textContent = message;
  document.getElementById("messages").appendChild(div);

  input.value = "";
  // Later: Send message via WebSocket
  ws.send(JSON.stringify({
    type: "message",
    receiver_id: contactId,
    message: message
  }));
}


document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  loadContacts();
  connectWebSocket();
});
