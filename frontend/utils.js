SERVER_IP = "localhost";

FRONTEND = "http://" + SERVER_IP + ":8000/frontend/";
API = "http://" + SERVER_IP + ":8000/backend/";
WS_URL = "ws://" + SERVER_IP + ":8080";

// Get a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Set a cookie with options
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

// Delete a cookie by name
function deleteCookie(name) {
  setCookie(name, '', { maxAge: 0 });
}


// Mobile viewport height fix for all pages
function fixMobileViewport() {
  let vh = window.innerHeight * 0.01; 
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Run on load & resize
window.addEventListener('load', fixMobileViewport);
window.addEventListener('resize', fixMobileViewport);

