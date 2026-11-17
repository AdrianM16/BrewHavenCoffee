// login / register (saved in localStorage)
(function () {
  const USERS_KEY = 'brewHavenUsers';
  const CURRENT_KEY = 'currentUser';

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  function initializeUsers() {
    if (read(USERS_KEY, null)) return;
    write(USERS_KEY, [
      { id: 1, username: 'admin', password: 'admin123', email: 'admin@brewhaven.ph', firstName: 'Admin', lastName: 'Barista', role: 'admin', createdAt: '2025-01-05T08:00:00.000Z' },
      { id: 2, username: 'customer', password: 'customer123', email: 'customer@example.com', firstName: 'Juan', lastName: 'Dela Cruz', role: 'customer', createdAt: '2025-03-14T08:00:00.000Z' }
    ]);
  }
  initializeUsers();

  const getUsers = () => read(USERS_KEY, []);
  const saveUsers = users => write(USERS_KEY, users);
  const getCurrentUser = () => read(CURRENT_KEY, null);
  const setCurrentUser = user => { const u = Object.assign({}, user); delete u.password; write(CURRENT_KEY, u); };
  const isLoggedIn = () => !!getCurrentUser();
  const isAdmin = () => { const u = getCurrentUser(); return !!u && u.role === 'admin'; };

  function logout() {
    try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
    window.location.href = 'index.html';
  }

  function login(identifier, password) {
    const id = String(identifier || '').trim().toLowerCase();
    const user = getUsers().find(u => (u.username.toLowerCase() === id || u.email.toLowerCase() === id) && u.password === password);
    if (user) setCurrentUser(user);
    return user || null;
  }

  function register(data) {
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) return { error: 'That username is taken. Try another one.' };
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) return { error: 'That email is already registered.' };
    const user = Object.assign({ id: Date.now(), role: 'customer', createdAt: new Date().toISOString() }, data);
    users.push(user);
    saveUsers(users);
    return { user };
  }

  function updateProfile(changes) {
    const current = getCurrentUser();
    if (!current) return { error: 'Not logged in.' };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx === -1) return { error: 'Account not found.' };
    if (changes.email && users.some((u, i) => i !== idx && u.email.toLowerCase() === changes.email.toLowerCase())) return { error: 'That email is used by another account.' };
    users[idx] = Object.assign({}, users[idx], changes);
    saveUsers(users);
    setCurrentUser(users[idx]);
    return { user: users[idx] };
  }

  function changePassword(currentPw, newPw) {
    const current = getCurrentUser();
    const users = getUsers();
    const idx = users.findIndex(u => current && u.id === current.id);
    if (idx === -1) return { error: 'Account not found.' };
    if (users[idx].password !== currentPw) return { error: 'Your current password is incorrect.' };
    if (newPw.length < 6) return { error: 'New password must be at least 6 characters.' };
    users[idx].password = newPw;
    saveUsers(users);
    return { ok: true };
  }

  function passwordStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  }

  // protect pages with data-guard
  const guard = document.body && document.body.dataset.guard;
  if (guard) {
    const next = encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
    if (!isLoggedIn()) {
      location.replace('login.html?next=' + next);
    } else if (guard === 'admin' && !isAdmin()) {
      location.replace('index.html?denied=1');
    }
  }

  window.Auth = { getUsers, getCurrentUser, isLoggedIn, isAdmin, logout, login, register, updateProfile, changePassword, passwordStrength };
  window.getCurrentUser = getCurrentUser;
  window.logout = logout;
  window.isAdmin = isAdmin;
})();
