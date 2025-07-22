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
      <div class="contact-avatar">${contact.username.charAt(0)}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.display_name}</div>
        <div class="contact-lastmsg">Tap to chat</div>
      </div>
    `;

    // Click → open chat
    contactDiv.onclick = () => openChatWith(contact.contact_id, contact.display_name, contact.username);

    list.appendChild(contactDiv);
  });
}

async function addContact() {
  const username = document.getElementById("new-contact-username").value.trim();
  if (!username) {
    alert("Enter a username");
    return;
  }

  const token = getCookie("auth_token");

  const res = await fetch("../backend/add_contact.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, username })
  });

  const data = await res.json();

  if (data.success) {
    alert(`Contact ${username} added!`);
    document.getElementById("new-contact-username").value = "";
    hideAddContactForm();
    loadContacts(); // reload list
  } else {
    alert("Failed to add contact: " + data.error);
  }
}

function showAddContactForm() {
  document.getElementById("add-contact-form").style.display = "block";
}

function hideAddContactForm() {
  document.getElementById("add-contact-form").style.display = "none";
  document.getElementById("new-contact-username").value = "";
}

function goToProfile() {
  window.location.replace("profile.html");
}

function goBackToList() {
  document.getElementById("chat-view").classList.remove("active");
  document.getElementById("chat-list").classList.remove("hidden");
}

function displayMessage(sender, messageText, timestamp = Date.now()) {
  const messagesContainer = document.getElementById("messages");

  // Create message wrapper
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  // Different style for outgoing vs incoming
  if (sender === "me") {
    msgDiv.classList.add("outgoing");  // style for messages I sent
  } else {
    msgDiv.classList.add("incoming");  // style for received messages
  }

  // Message bubble
  const textSpan = document.createElement("span");
  textSpan.classList.add("message-text");
  textSpan.textContent = messageText;

  // Timestamp (optional)
  const timeSpan = document.createElement("span");
  timeSpan.classList.add("message-time");
  timeSpan.textContent = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  // Add elements
  msgDiv.appendChild(textSpan);
  msgDiv.appendChild(timeSpan);

  messagesContainer.appendChild(msgDiv);

  // Auto-scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


async function openChatWith(contactId, displayname, username) {
  document.getElementById("chat-title").textContent = displayname;
  document.getElementById("chat-subtitle").textContent = "@" + username;
  document.getElementById("messages").innerHTML = "Loading chat...";
  document.getElementById("chat-view").classList.add("active");
  document.getElementById("chat-list").classList.add("hidden");
  const messages = loadMessagesLocally(contactId);
  messages.forEach(m => {
    displayMessage(m.sender, m.message, m.timestamp);
  });
  document.getElementById("send-button").onclick = () => sendMessage(contactId);
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
      saveMessageLocally(data.from, "me", data.message);
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
  /*if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("❌ WebSocket not open yet!");
    return;
  }*/

  // Append locally
  displayMessage("me", message);

  saveMessageLocally(contactId, "me", message);

  input.value = "";
  // Later: Send message via WebSocket
  ws.send(JSON.stringify({
    type: "message",
    receiver_id: contactId,
    message: message
  }));
}

function saveMessageLocally(contactId, sender, message) {
  const key = `chat_user_${contactId}`;
  let messages = JSON.parse(localStorage.getItem(key)) || [];
  
  messages.push({
    sender: sender,
    message: message,
    timestamp: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(messages));
}

function loadMessagesLocally(contactId) {
  const key = `chat_user_${contactId}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}

function clearConversationLocally(contactId) {
  const key = `chat_user_${contactId}`;
  localStorage.removeItem(key);
}


document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  loadContacts();
  connectWebSocket();
});

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});
