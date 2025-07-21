document.addEventListener("DOMContentLoaded", async () => {
  // First, require auth before loading profile
  await requireAuth();

  // Then load the profile details
  //await loadUserProfile();

  // Attach button events
  document.getElementById("gotochat-btn").addEventListener("click", () => {
	  window.location.replace("chat.html");
  });
  document.getElementById("update-btn").addEventListener("click", updateProfile);
  document.getElementById("logout-btn").addEventListener("click", logoutUser);
});

async function loadUserProfile() {
  const token = getCookie("auth_token");
  if (!token) {
    window.location.replace("login.html");
    return;
  }

  try {
    const res = await fetch("backend/get_profile.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (data.valid) {
      document.getElementById("profile-name").value = data.user.name;
      document.getElementById("profile-email").value = data.user.email;
    } else {
      window.location.replace("login.html");
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    window.location.replace("login.html");
  }
}

async function updateProfile() {
  const token = getCookie("auth_token");
  const newPassword = document.getElementById("profile-password").value.trim();

  if (!newPassword) {
    alert("Enter a new password to update.");
    return;
  }

  try {
    const res = await fetch("backend/update_profile.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword })
    });

    const data = await res.json();

    if (data.success) {
      alert("Profile updated successfully!");
    } else {
      alert("Update failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Update error:", err);
  }
}

function logoutUser() {
  let logoutconfirmed = confirm("Do you really want to logout?");
  if(!logoutconfirmed) {return;}
  deleteCookie("auth_token");
  window.location.replace("login.html");
}

