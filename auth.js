// Authentication System for Brew Haven Coffee Shop

// Initialize users from localStorage or create default users
function initializeUsers() {
  if (!localStorage.getItem('brewHavenUsers')) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@brewhaven.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'customer',
        password: 'customer123',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('brewHavenUsers', JSON.stringify(defaultUsers));
  }
}

// Get all users
function getUsers() {
  return JSON.parse(localStorage.getItem('brewHavenUsers') || '[]');
}

// Save users
function saveUsers(users) {
  localStorage.setItem('brewHavenUsers', JSON.stringify(users));
}

// Get current logged-in user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Set current user
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Check if user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
    
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 5000);
  }
}

// Login Form Handler
if (document.getElementById('loginForm')) {
  initializeUsers();
  
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const users = getUsers();
    const user = users.find(u => 
      (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
      // Remove password from stored user object
      const userToStore = { ...user };
      delete userToStore.password;
      
      setCurrentUser(userToStore);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      showAlert('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1500);
    } else {
      showAlert('Invalid username or password. Please try again.', 'error');
    }
  });
}

// Register Form Handler
if (document.getElementById('registerForm')) {
  initializeUsers();
  
  const passwordInput = document.getElementById('password');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  
  // Password strength checker
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    strengthFill.className = 'strength-fill';
    
    if (strength === 0 || strength === 1) {
      strengthFill.classList.add('strength-weak');
      strengthText.textContent = 'Weak password';
      strengthText.style.color = '#f44336';
    } else if (strength === 2 || strength === 3) {
      strengthFill.classList.add('strength-medium');
      strengthText.textContent = 'Medium password';
      strengthText.style.color = '#ff9800';
    } else {
      strengthFill.classList.add('strength-strong');
      strengthText.textContent = 'Strong password';
      strengthText.style.color = '#4caf50';
    }
  });
  
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!agreeTerms) {
      showAlert('Please agree to the Terms of Service and Privacy Policy.', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please try again.', 'error');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.', 'error');
      return;
    }
    
    const users = getUsers();
    
    // Check if username or email already exists
    if (users.find(u => u.username === username)) {
      showAlert('Username already exists. Please choose another one.', 'error');
      return;
    }
    
    if (users.find(u => u.email === email)) {
      showAlert('Email already registered. Please use another email.', 'error');
      return;
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      password,
      email,
      firstName,
      lastName,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    showAlert('Account created successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  });
}

// Update navigation based on login status
function updateNavigation() {
  const user = getCurrentUser();
  const nav = document.querySelector('nav ul');
  
  if (nav && user) {
    // Remove login link if exists
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.parentElement.remove();
    }
    
    // Add user menu if not exists
    if (!nav.querySelector('.user-menu')) {
      const userMenuItem = document.createElement('li');
      userMenuItem.className = 'user-menu';
      userMenuItem.innerHTML = `
        <a href="#" onclick="toggleUserMenu(); return false;">
          👤 ${user.firstName}
        </a>
        <div id="userDropdown" style="display:none; position:absolute; background:#fff; border:1px solid #ddd; border-radius:5px; padding:10px; margin-top:10px; min-width:150px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          <a href="profile.html" style="display:block; padding:8px; color:#333; text-decoration:none;">Profile</a>
          ${user.role === 'admin' ? '<a href="admin.html" style="display:block; padding:8px; color:#333; text-decoration:none;">Admin Panel</a>' : ''}
          <a href="#" onclick="logout(); return false;" style="display:block; padding:8px; color:#333; text-decoration:none;">Logout</a>
        </div>
      `;
      nav.appendChild(userMenuItem);
    }
  }
}

// Toggle user menu dropdown
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  
  if (dropdown && userMenu && !userMenu.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Protect admin pages
function protectAdminPage() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  if (!isAdmin()) {
    alert('Access denied. Admin privileges required.');
    window.location.href = 'index.html';
  }
}

// Social login (mock implementation)
function socialLogin(provider) {
  showAlert(`${provider} login is not yet implemented. Please use regular login.`, 'error');
}

// Forgot password (mock implementation)
function showForgotPassword() {
  const email = prompt('Please enter your email address:');
  if (email) {
    showAlert('Password reset link has been sent to your email.', 'success');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeUsers();
  updateNavigation();
  
  // Check if on admin page
  if (window.location.pathname.includes('admin.html')) {
    protectAdminPage();
  }
});