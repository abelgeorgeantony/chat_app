const API = 'http://localhost:8000/backend/';

async function register() {
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
  const res = await fetch(API + 'login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('login_email').value,
      password: document.getElementById('login_pass').value
    })
  });

  const data = await res.json();

  if (data.success) {
    setCookie('auth_token', data.token, {
	    maxAge: 86400, // 1 day
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



function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function setCookie(name, value, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAge) {
    cookie += `; max-age=${options.maxAge}`;
  }
  if (options.expires) {
    cookie += `; expires=${options.expires.toUTCString()}`;
  }
  if (options.path) {
    cookie += `; path=${options.path}`;
  } else {
    cookie += `; path=/`;
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }
  if (options.secure) {
    cookie += `; Secure`;
  }

  document.cookie = cookie;
}

