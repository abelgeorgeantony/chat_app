const API = 'http://localhost:8000/backend/';

async function register() {
	alert("hello from register");
  const res = await fetch(API + 'register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('reg_email').value,
      password: document.getElementById('reg_pass').value,
      display_name: document.getElementById('reg_name').value
    })
  });

  const data = await res.json();

  if (data.success) {
    alert('Registered successfully! Redirecting to login...');
    window.location.href = 'login.html';
  } else {
    alert(data.error);
  }
}

async function login() {
  const s_dur = parseInt(document.getElementById('session_length').value);

  const res = await fetch(API + 'login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('login_email').value,
      password: document.getElementById('login_pass').value,
      s_duration: s_dur
    })
  });

  const data = await res.json();

  if (data.success) {
    setCookie('auth_token', data.token, {
	    maxAge: s_dur,
	    sameSite: 'Strict',
	    secure: location.protocol === 'https:'
    });
    window.location.href = 'chat.html';
  } else {
    alert(data.error);
  }
}


# For seemless authentication on pages like login.html, register.html and index.html
async function redirectIfAuthenticated(targetPage = 'chat.html') {
  const token = getCookie('auth_token');
  if (!token) return;

  try {
    const res = await fetch(API + 'validate_token.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (data.valid) {
      window.location.href = targetPage;
    }
  } catch (err) {
    console.error('Auth check failed', err);
  }
}
# For gaining auth confirmation for protected tasks on pages like chat.html
async function requireAuth() {
  const token = getCookie('auth_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(API + 'validate_token.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (!data.valid) {
      window.location.href = 'login.html';
    }
  } catch (err) {
    console.error('Token validation failed:', err);
    window.location.href = 'login.html';
  }
}

