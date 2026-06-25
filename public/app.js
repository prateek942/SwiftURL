// app state
const API_BASE = '';

let authToken      = localStorage.getItem('swifturl_token')  || null;
let currentEmail   = localStorage.getItem('swifturl_email')  || '';
let lastShortened  = '';
let pendingDeleteId = null;

// page switching
function showPage(page, tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (!el) return;
  el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'auth')      { switchAuthTab(tab || 'login'); }
  if (page === 'dashboard') { updateUserDisplay(); loadUrls(); }
}

function switchAuthTab(tab) {
  const loginForm  = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');
  const slider     = document.getElementById('tab-slider');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    slider.classList.remove('right');
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    slider.classList.add('right');
  }
}

// api helper — adds auth token automatically
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res  = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  setBtnLoading('btn-login', true);
  try {
    const data = await apiFetch('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    authToken    = data.token;
    currentEmail = email;
    localStorage.setItem('swifturl_token', authToken);
    localStorage.setItem('swifturl_email', currentEmail);

    showToast('Welcome back! 🎉', 'success');
    showPage('dashboard');
    document.getElementById('form-login').reset();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBtnLoading('btn-login', false);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const firstname = document.getElementById('signup-firstname').value.trim();
  const lastname  = document.getElementById('signup-lastname').value.trim();
  const email     = document.getElementById('signup-email').value.trim();
  const password  = document.getElementById('signup-password').value;

  setBtnLoading('btn-signup', true);
  try {
    await apiFetch('/user/signup', {
      method: 'POST',
      body: JSON.stringify({ firstname, lastname, email, password }),
    });

    showToast('Account created! Please sign in. ✅', 'success');
    document.getElementById('form-signup').reset();
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBtnLoading('btn-signup', false);
  }
}

function handleLogout() {
  authToken = null;
  currentEmail = '';
  localStorage.removeItem('swifturl_token');
  localStorage.removeItem('swifturl_email');
  showToast('Logged out.', 'info');
  showPage('landing');
}

async function handleShorten(e) {
  e.preventDefault();
  const url  = document.getElementById('shorten-url').value.trim();
  const code = document.getElementById('shorten-code').value.trim();

  document.getElementById('shorten-result').classList.add('hidden');
  setBtnLoading('btn-shorten', true);

  try {
    const body = { url };
    if (code) body.code = code;

    const data = await apiFetch('/shorten', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const shortUrl = `${window.location.origin}/${data.data.shortCode}`;
    lastShortened  = shortUrl;

    const resultEl   = document.getElementById('shorten-result');
    const resultLink = document.getElementById('result-url');
    const resultOpen = document.getElementById('result-open');
    resultLink.href        = shortUrl;
    resultLink.textContent = shortUrl;
    if (resultOpen) { resultOpen.href = shortUrl; }
    resultEl.classList.remove('hidden');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.getElementById('form-shorten').reset();
    showToast('URL shortened! ✂️', 'success');
    loadUrls();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBtnLoading('btn-shorten', false);
  }
}

// fetch and render the user's urls
async function loadUrls() {
  const elLoading = document.getElementById('urls-loading');
  const elEmpty   = document.getElementById('urls-empty');
  const elTable   = document.getElementById('urls-table-wrapper');

  elLoading.classList.remove('hidden');
  elEmpty.classList.add('hidden');
  elTable.classList.add('hidden');

  try {
    const data = await apiFetch('/urls');
    const urls = (data.data || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const statEl = document.getElementById('stat-total');
    if (statEl) animateCount(statEl, urls.length);

    elLoading.classList.add('hidden');

    if (urls.length === 0) {
      elEmpty.classList.remove('hidden');
      return;
    }

    renderTable(urls);
    elTable.classList.remove('hidden');
  } catch (err) {
    elLoading.classList.add('hidden');
    showToast(err.message, 'error');
  }
}

function renderTable(urls) {
  const tbody = document.getElementById('urls-tbody');
  tbody.innerHTML = '';

  urls.forEach(item => {
    const shortUrl = `${window.location.origin}/${item.shortCode}`;
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const tr = document.createElement('tr');
    tr.id = `row-${item.id}`;
    tr.innerHTML = `
      <td data-label="Short URL">
        <a href="${shortUrl}" target="_blank" class="short-link" title="Click to open redirect">
          /${item.shortCode}
        </a>
      </td>
      <td data-label="Original URL">
        <div class="url-original" title="${escHtml(item.targetUrl)}">
          ${escHtml(truncate(item.targetUrl, 55))}
        </div>
      </td>
      <td data-label="Created"><span class="date-badge">${date}</span></td>
      <td>
        <div class="actions">
          <a href="${shortUrl}" target="_blank" class="btn-action btn-action-open" title="Open in browser">
            &#8599;
          </a>
          <button
            class="btn-action btn-action-copy"
            title="Copy short URL"
            onclick="copyUrl('${shortUrl}')">
            📋
          </button>
          <button
            class="btn-action btn-action-del"
            title="Delete"
            onclick="deleteUrl('${item.id}')">
            🗑️
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);

  });
}

// delete modal
function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById('modal-delete').classList.remove('hidden');
}

function closeDeleteModal(event) {
  if (event && event.target !== event.currentTarget) return;
  pendingDeleteId = null;
  document.getElementById('modal-delete').classList.add('hidden');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  pendingDeleteId = null;
  document.getElementById('modal-delete').classList.add('hidden');

  const row = document.getElementById(`row-${id}`);
  if (row) { row.style.opacity = '0.4'; row.style.pointerEvents = 'none'; }

  try {
    await apiFetch(`/urls/${id}`, { method: 'DELETE' });

    if (row) {
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity    = '0';
      row.style.transform  = 'translateX(40px)';
      setTimeout(() => {
        row.remove();
        refreshStatCount();
        checkEmpty();
      }, 320);
    }
    showToast('Link deleted! 🗑️', 'success');
  } catch (err) {
    if (row) { row.style.opacity = '1'; row.style.pointerEvents = 'auto'; }
    showToast(err.message, 'error');
  }
}

function deleteUrl(id) {
  openDeleteModal(id);
}

function refreshStatCount() {
  const rows = document.querySelectorAll('#urls-tbody tr');
  const statEl = document.getElementById('stat-total');
  if (statEl) statEl.textContent = rows.length;
}

function checkEmpty() {
  const rows = document.querySelectorAll('#urls-tbody tr');
  if (rows.length === 0) {
    document.getElementById('urls-table-wrapper').classList.add('hidden');
    document.getElementById('urls-empty').classList.remove('hidden');
  }
}

// clipboard
function copyUrl(url) {
  navigator.clipboard.writeText(url)
    .then(() => showToast('Copied to clipboard! 📋', 'success'))
    .catch(() => {
      // fallback for older browsers
      const inp = document.createElement('input');
      inp.value = url;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand('copy');
      document.body.removeChild(inp);
      showToast('Copied! 📋', 'success');
    });
}

function copyResult() {
  if (lastShortened) copyUrl(lastShortened);
}

function updateUserDisplay() {
  const emailEl  = document.getElementById('user-email-display');
  const avatarEl = document.getElementById('user-avatar');
  if (emailEl)  emailEl.textContent  = currentEmail || 'User';
  if (avatarEl) avatarEl.textContent = (currentEmail[0] || 'U').toUpperCase();
}

// ui helpers
function setBtnLoading(btnId, loading) {
  const btn    = document.getElementById(btnId);
  if (!btn) return;
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  text.classList.toggle('hidden', loading);
  loader.classList.toggle('hidden', !loading);
}

function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'i' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'i'}</span>
    <span class="toast-message">${escHtml(message)}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 360);
  }, 3200);
}

function animateCount(el, target) {
  const start    = parseInt(el.textContent) || 0;
  const duration = 600;
  const startTs  = performance.now();

  function step(ts) {
    const progress = Math.min((ts - startTs) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// boot up
function init() {
  const confirmBtn = document.getElementById('btn-confirm-delete');
  if (confirmBtn) confirmBtn.addEventListener('click', confirmDelete);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      pendingDeleteId = null;
      document.getElementById('modal-delete')?.classList.add('hidden');
    }
  });

  if (!authToken) { showPage('landing'); return; }

  // quick jwt expiry check
  try {
    const payload  = JSON.parse(atob(authToken.split('.')[1]));
    const expired  = payload.exp && Date.now() / 1000 > payload.exp;
    if (expired) { handleLogout(); return; }
  } catch (_) {
    handleLogout();
    return;
  }

  showPage('dashboard');
}

init();
