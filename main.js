// State
let currentUser = null;
let isRegisterMode = false;
let currentTheme = 'dark';

// Load saved settings on page load
function loadSavedSettings() {
  // Load theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    currentTheme = savedTheme;
    document.body.setAttribute('data-theme', savedTheme);
    
    // Update theme selector in settings
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.remove('active');
      if (option.getAttribute('data-theme') === savedTheme) {
        option.classList.add('active');
      }
    });
  }
  
  // Load notification settings
  const savedNotificationSettings = localStorage.getItem('notificationSettings');
  if (savedNotificationSettings) {
    try {
      const settings = JSON.parse(savedNotificationSettings);
      
      // Update notification toggles in settings
      const notificationInputs = document.querySelectorAll('#notificationsTab input[type="checkbox"]');
      if (notificationInputs.length >= 3) {
        notificationInputs[0].checked = settings.types.includes('email');
        notificationInputs[1].checked = settings.types.includes('push');
        notificationInputs[2].checked = settings.types.includes('sms');
      }
      
      // Update frequency selector
      const frequencySelector = document.getElementById('notificationFrequency');
      if (frequencySelector) {
        frequencySelector.value = settings.frequency || 'instant';
      }
    } catch (e) {
      console.log('Error loading notification settings:', e);
    }
  }
  
  // Load language settings
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    const languageSelector = document.getElementById('appLanguage');
    if (languageSelector) {
      languageSelector.value = savedLanguage;
    }
  }
}

// Initialize user data
function initializeUserData() {
  // Load current user from localStorage
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    document.getElementById('userInitial').textContent = currentUser.initial;
  }
  
  // Load profile picture if exists
  const savedProfilePic = localStorage.getItem('profilePicture');
  if (savedProfilePic && document.getElementById('profilePicture')) {
    document.getElementById('profilePicture').src = savedProfilePic;
  }
}

// Call loadSavedSettings when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadSavedSettings();
  initializeUserData();
  // Set initial visibility for chat/footer based on login state
  setChatVisibility();
  setFooterVisibility();

  // Check server info for AI fallback mode
  fetch('/api/info').then(r=>r.json()).then(info=>{
    if (info && info.useFakeAI) {
      showToast('AI Service Fallback','warning','OpenAI key not configured — using simulated responses');
    }
  }).catch(()=>{});
  
  // Ensure auth elements are properly initialized
  const toggleLogin = document.getElementById('toggleLogin');
  const toggleRegister = document.getElementById('toggleRegister');
  
  if (toggleLogin && toggleRegister) {
    console.log('Auth elements initialized');
  } else {
    console.warn('Some auth elements not found during initialization');
  }
  
  // Initialize auth button state and listeners
  updateAuthButtonState();

  // Ensure input listeners are attached (in case elements weren't present at script parse)
  ['identifier','password','displayName'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._has_auth_listener) {
      el.addEventListener('input', updateAuthButtonState);
      el._has_auth_listener = true;
    }
  });

  // If a user is already stored, show the home/dashboard instead of the login page
  if (currentUser) {
    // Only show home page automatically if the home page exists in the current document
    if (document.getElementById('homePage')) {
      showPage('homePage');
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector('.nav-btn[data-section="dashboard"]')?.classList.add('active');

      // Add a small welcome update in the feed to explain the Updates section
      const feed = document.getElementById('updatesFeed');
      if (feed) {
        const el = document.createElement('div');
        el.className = 'update-item';
        el.dataset.type = 'announcement';
        el.innerHTML = `<div class="update-header"><strong>Welcome to Updates</strong> <span class="update-meta">System • ${new Date().toLocaleString()}</span></div><div class="update-body">The Updates section acts as a real-time communication hub where team members receive timely information about meetings, deadlines, and organizational news. Use <strong>Post Update</strong> to share company-wide news.</div><div class="update-actions" style="margin-top:8px;"><button class="btn-small btn-gotit">Got it</button><div class="reactions" style="display:inline-block; margin-left:10px;"><button class="emoji">👍</button></div></div>`;
        feed.prepend(el);
      }
    }
  }

  // Handle deep links from other pages (e.g., index.html#openProfile)
  if (location.hash === '#openProfile') {
    // Wait a tick for any DOM updates, then open profile modal
    setTimeout(() => {
      if (!currentUser) {
        showToast('Please sign in to view your profile', 'warning');
        showLoginPage();
      } else {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('fullName').value = currentUser.name;
        document.getElementById('email').value = currentUser.email;
        const savedProfilePic = localStorage.getItem('profilePicture');
        document.getElementById('profilePicture').src = savedProfilePic || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=0D8ABC&color=fff');
        document.getElementById('profileModal').classList.add('active');
        // Clear hash to avoid reopening
        history.replaceState(null, '', 'index.html');
      }
    }, 200);
  } else if (location.hash === '#openSettings') {
    setTimeout(() => {
      const settingsModal = document.getElementById('settingsModal');
      if (settingsModal) settingsModal.classList.add('active');
      history.replaceState(null, '', 'index.html');
    }, 200);
  }
});

// Fallback AI response generator (used when AI service is unavailable)
function generateCompanyResponse(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('services') || m.includes('service')) {
    return 'Zerclix Technologies provides digital transformation, cloud migration, and custom software development. Visit our Services section for more details.';
  }
  if (m.includes('team') || m.includes('who') || m.includes('people')) {
    return 'Our team includes engineers, designers, and strategists focused on delivering results — see the Team page for profiles.';
  }
  if (m.includes('projects') || m.includes('project')) {
    return 'We deliver projects across cloud, web, and AI — check the Projects page for examples and statuses.';
  }
  return 'Thanks — I am using a local fallback right now. Please try again later for full AI-powered responses.';
}

// Auth utilities: local user store and password hashing
function getAuthUsers() {
  return JSON.parse(localStorage.getItem('authUsers') || '{}');
}
function setAuthUsers(u) {
  localStorage.setItem('authUsers', JSON.stringify(u));
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function hashPassword(password) {
  if (!password) return null;
  try {
    if (window.crypto && crypto.subtle) {
      const enc = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest('SHA-256', enc);
      return arrayBufferToBase64(digest);
    }
  } catch (e) {}
  // Fallback (not secure; demo only)
  return btoa(password);
}

async function registerUser(identifier, password, name, provider=null) {
  const users = getAuthUsers();
  if (users[identifier]) return { success: false, error: 'An account with that identifier already exists.' };
  const hash = provider ? null : await hashPassword(password);
  const id = (name || identifier).toLowerCase().replace(/[^a-z0-9]+/g,'-');
  users[identifier] = { id, identifier, name: name || identifier, passwordHash: hash, provider };
  setAuthUsers(users);
  return { success: true, user: users[identifier] };
}

async function attemptLogin(identifier, password) {
  const users = getAuthUsers();
  const u = users[identifier];
  if (!u) return { success: false, error: 'No account found for that identifier.' };

  // If account created via social provider
  if (u.provider) return { success: false, error: `This account is linked to ${u.provider}. Use Continue with ${u.provider}.` };

  // Check for lock
  const lockedKey = 'lockedUntil_' + identifier;
  const locked = Number(localStorage.getItem(lockedKey) || '0');
  if (locked && Date.now() < locked) return { success: false, error: 'Account temporarily locked due to multiple failed attempts. Please try again later.' };

  const hash = await hashPassword(password);
  if (hash === u.passwordHash) {
    // reset failed attempts
    localStorage.removeItem('failedAttempts_' + identifier);
    localStorage.removeItem(lockedKey);
    return { success: true, user: u };
  } else {
    const key = 'failedAttempts_' + identifier;
    const attempts = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(attempts));
    if (attempts >= 5) {
      // lock for 5 minutes
      localStorage.setItem(lockedKey, String(Date.now() + 5 * 60 * 1000));
      return { success: false, error: 'Too many failed attempts. Account locked for 5 minutes.' };
    }
    return { success: false, error: 'Incorrect password. Please try again.' };
  }
}

// Safely show login page only when not already signed-in
function showLoginPage() {
  if (localStorage.getItem('currentUser')) {
    showToast('You are already signed in', 'info');
    if (document.getElementById('homePage')) showPage('homePage');
    return;
  }
  showPage('loginPage');
}

// Particle System (only initialize if canvas exists on the page)
const canvas = document.getElementById('particles');
let ctx = null;
let particles = [];
let mouseX = 0, mouseY = 0;
let width = window.innerWidth;
let height = window.innerHeight;

if (canvas) {
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.5 + 0.3;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const force = (150 - dist) / 150;
      this.x -= dx * force * 0.01;
      this.y -= dy * force * 0.01;
    }
  }
  
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 255, ${this.opacity})`;
    ctx.fill();
  }
}

  function createParticles() {
    const count = Math.min(Math.floor(width * height / 10000), 100);
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 245, 255, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    createParticles();
  });

  createParticles();
  animate();
}

// Page Navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(pageId);
  if (pageEl) pageEl.classList.add('active');
  window.scrollTo(0, 0);
}

// Auth Toggle
function toggleMode(mode) {
  // Prevent switching to auth toggles when user is already logged in
  if (currentUser) { showToast('You are already logged in', 'info'); showPage('homePage'); return; }
  isRegisterMode = mode === 'register';
  
  // Get elements each time the function is called
  const toggleLogin = document.getElementById('toggleLogin');
  const toggleRegister = document.getElementById('toggleRegister');
  const authTitle = document.getElementById('authTitle');
  const displayNameGroup = document.getElementById('displayNameGroup');
  const submitText = document.getElementById('submitText');
  const toggleIndicator = document.querySelector('.toggle-indicator');
  
  // Check if elements exist before manipulating them
  if (!toggleLogin || !toggleRegister || !authTitle || !displayNameGroup || !submitText || !toggleIndicator) {
    console.warn('Some auth elements not found');
    return;
  }
  
  if (isRegisterMode) {
    toggleLogin.classList.remove('active');
    toggleRegister.classList.add('active');
    toggleIndicator.style.transform = 'translateX(calc(100% + 8px))';
    authTitle.textContent = 'Create Your Account';
    displayNameGroup.classList.remove('hidden');
    submitText.textContent = 'Create Account';
  } else {
    toggleLogin.classList.add('active');
    toggleRegister.classList.remove('active');
    toggleIndicator.style.transform = 'translateX(0)';
    authTitle.textContent = 'Welcome Back';
    displayNameGroup.classList.add('hidden');
    submitText.textContent = 'Login';
  }
  // Update auth button state after toggle
  updateAuthButtonState();
}

function updateAuthButtonState() {
  const identifier = document.getElementById('identifier')?.value.trim() || '';
  const password = document.getElementById('password')?.value.trim() || '';
  const displayName = document.getElementById('displayName')?.value.trim() || '';
  const submitBtn = document.getElementById('authSubmit');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Accept either a valid email OR a phone number (digits only, length 7-15)
  const digitsOnly = identifier.replace(/\D/g, '');
  const phoneValid = digitsOnly.length >= 7 && digitsOnly.length <= 15;
  const identValid = emailRegex.test(identifier) || (identifier.length > 0 && phoneValid);
  let valid = identValid && password.length >= 6;
  if (isRegisterMode) valid = valid && displayName.length >= 3;
  if (submitBtn) {
    submitBtn.disabled = !valid;
    submitBtn.classList.toggle('disabled', !valid);
  }
}

// Attach input listeners to keep button state current
['identifier','password','displayName'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateAuthButtonState);
});

// Fallback: attach direct click listeners to auth toggles to ensure they work
document.getElementById('toggleLogin')?.addEventListener('click', () => toggleMode('login'));
document.getElementById('toggleRegister')?.addEventListener('click', () => toggleMode('register'));

document.addEventListener('click', function(e) {
  if (e.target.id === 'toggleLogin') {
    console.log('Toggle Login clicked');
    toggleMode('login');
  } else if (e.target.id === 'toggleRegister') {
    console.log('Toggle Register clicked');
    toggleMode('register');
  } else if (e.target.closest('.auth-toggle') && (e.target.id === 'toggleLogin' || e.target.id === 'toggleRegister')) {
    console.log('Auth toggle clicked via delegation');
    if (e.target.id === 'toggleLogin') {
      toggleMode('login');
    } else if (e.target.id === 'toggleRegister') {
      toggleMode('register');
    }
  }
});

// Auth Submit with Loading
document.addEventListener('click', function(e) {
  if (e.target.id === 'authSubmit' || e.target.closest('#authSubmit')) {
    console.log('Auth Submit clicked');
    // Prevent auth flow when already logged in
    if (currentUser) { showToast('You are already logged in', 'info'); showPage('homePage'); return; }

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value.trim();
  
  if (!identifier || !password) {
    showToast('Please fill in all fields!', 'error');
    return;
  }
  
  // Determine whether identifier is email or phone and validate accordingly
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = identifier.includes('@');
  if (isEmail) {
    if (!emailRegex.test(identifier)) {
      showToast('Please enter a valid email address!', 'error');
      return;
    }
  } else {
    const digits = identifier.replace(/\D/g, '');
    if (digits.length < 7) {
      showToast('Please enter a valid phone number!', 'error');
      return;
    }
  }
  
  // Show loading
  document.getElementById('loadingOverlay').classList.add('active');
  
  setTimeout(async () => {
    if (isRegisterMode) {
      const displayName = document.getElementById('displayName').value.trim();
      if (!displayName) {
        document.getElementById('loadingOverlay').classList.remove('active');
        showToast('Please enter a username!', 'error');
        return;
      }

      // Register user (persisted in localStorage 'authUsers')
      const reg = await registerUser(identifier, password, displayName, null);
      if (!reg.success) {
        document.getElementById('loadingOverlay').classList.remove('active');
        showToast(reg.error, 'error');
        return;
      }

      const user = reg.user;
      currentUser = {
        id: user.id,
        name: user.name,
        email: identifier,
        role: 'Admin',
        initial: (user.name && user.name.charAt(0).toUpperCase()) || 'U'
      };
      // Persist user and enable all permissions for demo
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('forceAllPermissions', 'true');
      showToast('Account Created!', 'success');

      // Show confirmation modal (works for email or phone)
      document.getElementById('confirmationEmail').textContent = identifier;
      const modalHeader = document.querySelector('#emailConfirmationModal .modal-header h2');
      if (modalHeader) modalHeader.textContent = isEmail ? 'Email Confirmation' : 'Phone Confirmation';
      document.getElementById('loadingOverlay').classList.remove('active');
      document.getElementById('emailConfirmationModal').classList.add('active');
      startResendTimer();

      if (isEmail) {
        // Send welcome email
        sendWelcomeEmail(identifier, displayName);
        showToast('Please check your email to confirm your account.', 'info');
      } else {
        // Simulate sending an SMS for phone registrations
        sendWelcomeSMS(identifier, displayName);
        showToast(`Verification SMS sent to ${identifier}`, 'info');
      }
    } else {
      // Perform credential check
      const res = await attemptLogin(identifier, password);
      if (!res.success) {
        document.getElementById('loadingOverlay').classList.remove('active');
        showToast(res.error, 'error');
        return;
      }

      const u = res.user;
      currentUser = {
        id: u.id,
        name: u.name,
        email: u.identifier,
        role: 'Admin',
        initial: (u.name && u.name.charAt(0).toUpperCase()) || (identifier.charAt(0) || 'U').toUpperCase()
      };
      // Persist user for session/demo and enable all permissions
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('forceAllPermissions', 'true');
      showToast('Signed in', 'success');
      document.getElementById('loadingOverlay').classList.remove('active');
      showPage('homePage');
    }
  }, 900);      
      // For demo purposes, we'll simulate sending a login alert email
      showNotification('🔐 Security Alert', `New login detected from your account (${identifier}). If this wasn't you, please change your password immediately.`, 'warning');
      
      // Also show a toast notification about the login alert
      showToast('Login Alert Sent', 'info', `A security alert has been sent to ${identifier}`);
      
      document.getElementById('loadingOverlay').classList.remove('active');
      
      // Update UI
      document.getElementById('userInitial').textContent = currentUser.initial;
      
      // Redirect to home page immediately
      showPage('homePage');
      
      // Update header to show active state for dashboard
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector('.nav-btn[data-section="dashboard"]')?.classList.add('active');
    }
  }, 1500);


// Add event listener for Enter key in password field
document.getElementById('password')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('authSubmit')?.click();
  }
});

// Forgot password link opens reset modal
document.getElementById('forgotPasswordLink')?.addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('passwordResetModal')?.classList.add('active');
  // reset modal to step 1
  document.getElementById('passwordResetStep1').style.display = 'block';
  document.getElementById('passwordResetStep2').style.display = 'none';
  document.getElementById('resetIdentifier').value = document.getElementById('identifier')?.value || '';
});

// Close password reset
document.getElementById('closePasswordReset')?.addEventListener('click', function() {
  const modal = document.getElementById('passwordResetModal');
  if (modal) modal.classList.remove('active');
});

// Handle find account for reset
document.getElementById('sendResetBtn')?.addEventListener('click', function() {
  const ident = document.getElementById('resetIdentifier')?.value?.trim();
  if (!ident) { showToast('Please enter your email or phone', 'error'); return; }
  const users = getAuthUsers();
  if (!users[ident]) {
    showToast('No account found for that identifier', 'error');
    return;
  }
  // proceed to step 2: set new password
  document.getElementById('passwordResetStep1').style.display = 'none';
  document.getElementById('passwordResetStep2').style.display = 'block';
  document.getElementById('resetIdentifierDisplay').textContent = ident;
});

// Confirm new password
document.getElementById('confirmResetBtn')?.addEventListener('click', async function() {
  const ident = document.getElementById('resetIdentifierDisplay')?.textContent;
  const np = document.getElementById('resetNewPassword')?.value?.trim();
  const cp = document.getElementById('resetConfirmPassword')?.value?.trim();
  if (!np || np.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  if (np !== cp) { showToast('Passwords do not match', 'error'); return; }
  const users = getAuthUsers();
  const user = users[ident];
  if (!user) { showToast('Unable to find account', 'error'); return; }
  user.passwordHash = await hashPassword(np);
  users[ident] = user;
  setAuthUsers(users);
  showToast('Password updated successfully', 'success');
  document.getElementById('passwordResetModal')?.classList.remove('active');
});

// OAuth (simulated) buttons
async function socialSignIn(provider) {
  const email = prompt(`Continue with ${provider} - please enter the email to use:`);
  if (!email) return;
  const name = email.split('@')[0];
  const users = getAuthUsers();
  if (!users[email]) {
    // create an account linked to provider
    await registerUser(email, null, name, provider);
  }
  const u = getAuthUsers()[email];
  currentUser = { id: u.id, name: u.name, email: u.identifier, role: 'Admin', initial: (u.name && u.name.charAt(0).toUpperCase()) || 'U' };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  localStorage.setItem('forceAllPermissions', 'true');
  showToast(`Signed in with ${provider}`, 'success');
  showPage('homePage');
}

document.getElementById('oauthGoogle')?.addEventListener('click', () => socialSignIn('Google'));
document.getElementById('oauthFacebook')?.addEventListener('click', () => socialSignIn('Facebook'));
document.getElementById('oauthGithub')?.addEventListener('click', () => socialSignIn('GitHub'));

// Email Confirmation Modal Events
document.addEventListener('click', function(e) {
  if (e.target.id === 'closeEmailConfirmation' || e.target.id === 'closeEmailConfirmationBtn') {
    document.getElementById('emailConfirmationModal').classList.remove('active');
    showPage('homePage');
    // Update UI
    if (currentUser) {
      document.getElementById('userInitial').textContent = currentUser.initial;
    }
  } else if (e.target.id === 'resendEmail') {
    showToast('Confirmation Sent!', 'success', 'Verification has been resent.');
    startResendTimer();
  }
});

// Simulate sending welcome email
function sendWelcomeEmail(email, name) {
  // In a real application, this would be an API call to your backend
  console.log(`Sending welcome email to ${email} for user ${name}`);
  
  // Show notification that email was sent
  showNotification('📧 Welcome Email Sent', `A welcome email has been sent to ${email}. Please check your inbox to confirm your account.`, 'info');
  
  // For demo purposes, we'll simulate email confirmation after 10 seconds
  setTimeout(() => {
    if (document.getElementById('emailConfirmationModal').classList.contains('active')) {
      showToast('Email Confirmed!', 'success', 'Your email has been confirmed. Welcome to Zerclix!');
      
      // Auto-close the confirmation modal after 3 seconds
      setTimeout(() => {
        if (document.getElementById('emailConfirmationModal').classList.contains('active')) {
          document.getElementById('emailConfirmationModal').classList.remove('active');
          showPage('homePage');
          // Update UI
          document.getElementById('userInitial').textContent = currentUser.initial;
        }
      }, 3000);
    }
  }, 10000);
}

// Simulate sending a verification SMS for phone signups
function sendWelcomeSMS(phone, name) {
  console.log(`Sending welcome SMS to ${phone} for user ${name}`);
  showNotification('📱 Verification SMS Sent', `A verification SMS has been sent to ${phone}.`, 'info');
  // For demo purposes, auto-confirm after a short delay
  setTimeout(() => {
    if (document.getElementById('emailConfirmationModal') && document.getElementById('emailConfirmationModal').classList.contains('active')) {
      showToast('Phone Confirmed!', 'success', 'Your phone number has been verified. Welcome!');
      setTimeout(() => {
        if (document.getElementById('emailConfirmationModal').classList.contains('active')) {
          document.getElementById('emailConfirmationModal').classList.remove('active');
          showPage('homePage');
          if (currentUser) document.getElementById('userInitial').textContent = currentUser.initial;
        }
      }, 1500);
    }
  }, 5000);
} 

// Resend timer function
function startResendTimer() {
  const resendBtn = document.getElementById('resendEmail');
  const timerElement = document.getElementById('resendTimer');
  const timerCount = document.getElementById('timerCount');
  
  resendBtn.disabled = true;
  timerElement.style.display = 'block';
  
  let count = 30;
  timerCount.textContent = count;
  
  const timer = setInterval(() => {
    count--;
    timerCount.textContent = count;
    
    if (count <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      timerElement.style.display = 'none';
    }
  }, 1000);
}

// Theme Toggle
document.addEventListener('click', function(e) {
  if (e.target.id === 'themeToggle') {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    showToast('Theme changed!', 'info', `Switched to ${currentTheme} mode`);
    
    // Update theme across all open tabs/windows
    localStorage.setItem('themeBroadcast', JSON.stringify({
      theme: currentTheme,
      timestamp: Date.now()
    }));
  }
});

// Listen for theme changes from other tabs
window.addEventListener('storage', function(e) {
  if (e.key === 'themeBroadcast' && e.newValue) {
    try {
      const data = JSON.parse(e.newValue);
      if (data.theme && data.timestamp) {
        // Only update if it's a newer broadcast
        const currentBroadcast = localStorage.getItem('themeBroadcastLastApplied');
        if (!currentBroadcast || JSON.parse(currentBroadcast).timestamp < data.timestamp) {
          document.body.setAttribute('data-theme', data.theme);
          currentTheme = data.theme;
          localStorage.setItem('theme', data.theme);
          localStorage.setItem('themeBroadcastLastApplied', e.newValue);
        }
      }
    } catch (err) {
      console.error('Error parsing theme broadcast:', err);
    }
  }
});

// Notifications Panel
document.addEventListener('click', function(e) {
  if (e.target.id === 'notificationBtn') {
    const np = document.getElementById('notificationsPanel');
    if (np) np.classList.add('active');
  } else if (e.target.id === 'closeNotifications') {
    const np = document.getElementById('notificationsPanel');
    if (np) np.classList.remove('active');
  }
});

// Chat Widget
document.addEventListener('click', function(e) {
  if (e.target.id === 'chatToggle') {
    const cb = document.getElementById('chatBox');
    if (cb) cb.classList.toggle('active');
  } else if (e.target.id === 'closeChat') {
    const cb = document.getElementById('chatBox');
    if (cb) cb.classList.remove('active');
  } else if (e.target.id === 'chatSend') {
    sendMessage();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.target && e.target.id === 'chatInput' && e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Function to send message to AI API

// Function to send message to AI API
async function getAIResponse(message) {
  // Attach a user identifier if available so the server can dedupe per-user
  const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const userId = savedUser?.id || savedUser?.identifier || 'guest';

  // First try to connect to the backend API
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userId }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // If the server supplied sources separately, append them in a short footnote
      if (data.sources && data.sources.length > 0) {
        const srcText = `\n\nSources: ${data.sources.map(s => s.title).join(', ')}`;
        return `${data.response}${srcText}`;
      }
      return data.response;
    } else {
      console.error('AI API Error:', data.error);
      // If API call fails, use simulated responses
      return generateCompanyResponse(message);
    }
  } catch (error) {
    console.error('Network error or server not running:', error);
    // Fallback to simulated responses
    return generateCompanyResponse(message);
  }
}

// Updated sendMessage function to use AI API
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  
  // Add user message
  const messagesContainer = document.getElementById('chatMessages');
  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.innerHTML = `<div>${message}</div>`;
  messagesContainer.appendChild(userMsg);
  
  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot';
  typingIndicator.id = 'typing-indicator';
  typingIndicator.innerHTML = `<div><i>AI is thinking...</i></div>`;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    // Get response from AI API
    const response = await getAIResponse(message);
    
    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    // Add AI response
    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.innerHTML = `<div>${response}</div>`;
    messagesContainer.appendChild(botMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    // Remove typing indicator
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    // Add error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'message bot';
    errorMsg.innerHTML = `<div>I'm having trouble connecting to our AI service. Please try again later.</div>`;
    messagesContainer.appendChild(errorMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Search Functionality
document.addEventListener('input', function(e) {
  if (e.target.id === 'searchInput') {
    const searchClear = document.getElementById('searchClear');
    if (e.target.value.length > 0) {
      searchClear.classList.add('active');
    } else {
      searchClear.classList.remove('active');
    }
  }
});

document.addEventListener('click', function(e) {
  if (e.target.id === 'searchClear') {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    searchInput.value = '';
    searchClear.classList.remove('active');
    searchInput.focus();
  }
});

// Toast Notifications
function showToast(title, type = 'success', message = '') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.success}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Settings Button
function openSettings() {
  document.getElementById('settingsModal').classList.add('active');
}

// Close Settings Modal
document.addEventListener('click', function(e) {
  if (e.target.id === 'closeSettings' || e.target.id === 'cancelSettings') {
    document.getElementById('settingsModal').classList.remove('active');
  }
});

// Save Settings
document.addEventListener('click', function(e) {
  if (e.target.id === 'saveSettings') {
  // Save notification settings
  const notificationSettings = {
    enabled: true,
    types: [],
    frequency: document.getElementById('notificationFrequency').value
  };
  
  // Collect enabled notification types
  const notificationCheckboxes = document.querySelectorAll('#notificationsTab input[type="checkbox"]');
  if (notificationCheckboxes.length >= 3) {
    if (notificationCheckboxes[0].checked) {
      notificationSettings.types.push('email');
    }
    if (notificationCheckboxes[1].checked) {
      notificationSettings.types.push('push');
    }
    if (notificationCheckboxes[2].checked) {
      notificationSettings.types.push('sms');
    }
  }
  
  // Save to localStorage
  localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  
  // Save theme preference
  localStorage.setItem('theme', currentTheme);
  
  // Save language preference
  const language = document.getElementById('appLanguage').value;
  localStorage.setItem('language', language);
  
    document.getElementById('settingsModal').classList.remove('active');
    showToast('Settings Saved', 'success', 'Your settings have been saved successfully!');
  }
});

// Settings Navigation
document.querySelector('.settings-nav')?.addEventListener('click', function(e) {
  if (e.target.closest('.nav-item')) {
    const item = e.target.closest('.nav-item');
    // Remove active class from all items
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    // Add active class to clicked item
    item.classList.add('active');
    
    // Hide all tabs
    document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    const tabId = item.getAttribute('data-tab') + 'Tab';
    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.classList.add('active');
  }
});

// Theme Selection
document.addEventListener('click', function(e) {
  if (e.target.closest('.theme-option')) {
    const option = e.target.closest('.theme-option');
    document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
    option.classList.add('active');
    
    const theme = option.getAttribute('data-theme');
    document.body.setAttribute('data-theme', theme);
    currentTheme = theme;
    
    showToast('Theme Updated', 'success', `Switched to ${theme} mode`);
  }
});

// Nav Menu
document.addEventListener('click', function(e) {
  if (e.target.closest('.nav-btn')) {
    const btn = e.target.closest('.nav-btn');
    const section = btn.dataset.section;
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Handle navigation
    if (section === 'dashboard') {
      window.location.href = 'index.html';
    } else if (section === 'projects') {
      window.location.href = 'project.html';
    } else if (section === 'team') {
      window.location.href = 'team.html';
    } else {
      showToast('Section Changed', 'info', `Viewing ${section}`);
    }
  }
});

// Generic data-href handler (works on login page and anywhere)
document.addEventListener('click', function(e) {
  const link = e.target.closest('[data-href]');
  if (link) {
    const href = link.getAttribute('data-href');
    if (href) window.location.href = href;
  }
});

// Profile and Settings Buttons
document.addEventListener('click', function(e) {
  if (e.target.closest('#profileBtn')) {
    const profileModalEl = document.getElementById('profileModal');
    if (profileModalEl) {
      // Check if currentUser exists
      if (!currentUser) {
        showToast('Please sign in to view your profile', 'warning');
        showLoginPage();
        return;
      }

      // Set profile data
      document.getElementById('profileName').textContent = currentUser.name;
      document.getElementById('fullName').value = currentUser.name;
      document.getElementById('email').value = currentUser.email;
      // Check if user has uploaded a custom profile picture
      const savedProfilePic = localStorage.getItem('profilePicture');
      if (savedProfilePic) {
        document.getElementById('profilePicture').src = savedProfilePic;
      } else {
        document.getElementById('profilePicture').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=0D8ABC&color=fff';
      }

      document.getElementById('profileModal').classList.add('active');
    } else {
      // Not on index page - redirect and request the profile modal to open
      window.location.href = 'index.html#openProfile';
    }
  } else if (e.target.closest('#settingsBtn')) {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
      settingsModal.classList.add('active');
    } else {
      window.location.href = 'index.html#openSettings';
    }
  }
});

// Profile Modal Events
document.addEventListener('click', function(e) {
  if (e.target.id === 'closeProfile' || e.target.id === 'cancelProfile') {
    document.getElementById('profileModal').classList.remove('active');
  } else if (e.target.id === 'saveProfile') {
    const fullName = document.getElementById('fullName').value;
    if (currentUser) {
      currentUser.name = fullName;
      currentUser.email = document.getElementById('email').value;
      document.getElementById('profileName').textContent = fullName;
      document.getElementById('userInitial').textContent = fullName.charAt(0).toUpperCase();
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update profile picture source if it exists
      const profilePicSrc = document.getElementById('profilePicture').src;
      if (profilePicSrc) {
        localStorage.setItem('profilePicture', profilePicSrc);
      }
    }
    document.getElementById('profileModal').classList.remove('active');
    showToast('Profile Updated', 'success', 'Your profile has been updated successfully!');
  } else if (e.target.id === 'changePicBtn') {
    // Show options to change or remove picture
    if (confirm('Would you like to upload a new picture? Click OK to upload or Cancel to remove current picture.')) {
      const ppi = document.getElementById('profilePicInput');
      if (ppi) ppi.click();
    } else {
      // Remove current picture
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {name: 'User'};
      document.getElementById('profilePicture').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=0D8ABC&color=fff';
      localStorage.removeItem('profilePicture');
      showToast('Profile Picture Removed', 'success', 'Your profile picture has been removed');
    }
  } else if (e.target.id === 'logoutBtn') {
    if (confirm('Are you sure you want to log out?')) {
      // Clear user data from localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('profilePicture');
      
      // Reset current user variable
      currentUser = null;
      
      // Update UI
      document.getElementById('userInitial').textContent = 'U';
      document.getElementById('profileModal').classList.remove('active');
      
      // Redirect to login page (if logged out)
      showLoginPage();
      
      showToast('Logged Out', 'info', 'You have been successfully logged out');
    }
  } else if (e.target.id === 'deleteAccountBtn') {
    if (confirm('⚠️ DANGER ZONE ⚠️\n\nAre you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      if (confirm('Final confirmation: Do you really want to delete your account? This cannot be reversed.')) {
        // Clear all user data from localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('profilePicture');
        
        // Reset current user variable
        currentUser = null;
        
        // Update UI
        document.getElementById('userInitial').textContent = 'U';
        document.getElementById('profileModal').classList.remove('active');
        
        // Redirect to home page
        showPage('homePage');
        
        showToast('Account Deleted', 'warning', 'Your account has been permanently deleted');
      }
    }
  } else if (e.target.id === 'deactivateAccountBtn') {
    if (confirm('Are you sure you want to deactivate your account? You will be able to reactivate it later by logging in again.')) {
      // In a real app, this would mark the account as deactivated
      // For this demo, we'll just log out but preserve the account data
      
      // Update user status to deactivated
      let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      currentUser.deactivated = true;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update UI
      document.getElementById('userInitial').textContent = 'U';
      document.getElementById('profileModal').classList.remove('active');
      
      // Redirect to home page
      showPage('homePage');
      
      showToast('Account Deactivated', 'info', 'Your account has been deactivated. You can reactivate it by logging in again.');
    }
  }
});

// Handle profile picture upload
function handleProfilePicUpload(e) {
  if (this.files && this.files[0]) {
    const file = this.files[0];
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      showToast('Invalid File Type', 'error', 'Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'error', 'Please select an image smaller than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profilePicture').src = e.target.result;
      // Save to localStorage
      localStorage.setItem('profilePicture', e.target.result);
      showToast('Profile Picture Updated', 'success', 'Your profile picture has been updated');
    }
    reader.readAsDataURL(file);
  }
}

document.getElementById('profilePicInput')?.addEventListener('change', handleProfilePicUpload);

// Open profile from any 'open-profile-btn'
document.addEventListener('click', function(e) {
  if (e.target.closest('.open-profile-btn')) {
    if (!currentUser) {
      showToast('Please sign in to view profiles', 'warning');
      showLoginPage();
      return;
    }
    // Populate profile modal
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('fullName').value = currentUser.name;
    document.getElementById('email').value = currentUser.email;
    const savedProfilePic = localStorage.getItem('profilePicture');
    document.getElementById('profilePicture').src = savedProfilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=0D8ABC&color=fff';
    document.getElementById('profileModal').classList.add('active');
  }
});

// Company Update Modal handlers
document.getElementById('companyUpdateBtn')?.addEventListener('click', function(){ 
  if (!currentUser) { showToast('Please sign in to post updates', 'warning'); showLoginPage(); return; }
  document.getElementById('companyUpdateModal').classList.add('active'); 
});

document.getElementById('createUpdateFromSection')?.addEventListener('click', function(){ document.getElementById('companyUpdateModal').classList.add('active'); });

document.getElementById('closeCompanyUpdate')?.addEventListener('click', ()=> document.getElementById('companyUpdateModal').classList.remove('active'));
document.getElementById('cancelCompanyUpdate')?.addEventListener('click', ()=> document.getElementById('companyUpdateModal').classList.remove('active'));

document.getElementById('updateType')?.addEventListener('change', function(){
  const mt = document.getElementById('meetingDetails');
  mt.style.display = this.value==='meeting' ? 'block' : 'none';
});

// Posting company updates
document.getElementById('postCompanyUpdate')?.addEventListener('click', function(){
  const title = document.getElementById('updateTitle').value.trim() || 'Company Update';
  const type = document.getElementById('updateType').value;
  const body = document.getElementById('updateBody').value.trim();
  const priority = document.querySelector('input[name="priority"]:checked')?.value || 'normal';
  const meetingDate = document.getElementById('meetingDate')?.value;
  const meetingAgenda = document.getElementById('meetingAgenda')?.value;
  const notifyEmail = document.getElementById('notifyEmail')?.checked;
  const notifyPush = document.getElementById('notifyPush')?.checked;
  const author = currentUser ? currentUser.name : 'System';
  const now = new Date().toLocaleString();

  const container = document.createElement('div');
  container.className = 'update-item';
  container.dataset.type = type;
  container.innerHTML = `<div class="update-header"><strong>${title}</strong> <span class="update-meta">${author} • ${now} ${priority!=='normal' ? '<span class="priority-tag">'+priority+'</span>' : ''}</span></div>
  <div class="update-body">${body ? body : ''}${type==='meeting' ? '<div class="meeting-info" style="margin-top:8px;"><div><strong>When:</strong> '+(meetingDate? new Date(meetingDate).toLocaleString() : 'TBD')+'</div><div><strong>Agenda:</strong> '+(meetingAgenda||'—')+'</div></div>' : ''}</div>
  <div class="update-actions" style="margin-top:8px;"><button class="btn-small btn-gotit">Got it</button><button class="btn-small btn-comment">Comment</button>${type==='meeting' ? '<button class="btn-small btn-add-calendar">Add to Calendar</button><button class="btn-small btn-join">Join Meeting</button>' : ''}<div class="reactions" style="display:inline-block; margin-left:10px;"><button class="emoji">👍</button><button class="emoji">🎉</button><button class="emoji">👏</button></div></div>
  <div class="comments" style="display:none;margin-top:8px;"></div>`;

  const feed = document.getElementById('updatesFeed');
  if (feed) feed.prepend(container);
  document.getElementById('companyUpdateModal').classList.remove('active');
  showToast('Update Posted', 'success', 'Your update has been posted to the Updates feed.');
  if (notifyPush) showNotification('📢 '+title, body || 'New company update', 'info');
  if (notifyEmail && currentUser) showToast('Email Sent', 'info', `An email has been queued to notify members.`);
});

// Delegate interactions within updates feed
const updatesFeedEl = document.getElementById('updatesFeed');
updatesFeedEl?.addEventListener('click', function(e){
  const got = e.target.closest('.btn-gotit');
  if (got) {
    const btn = got;
    btn.classList.toggle('acknowledged');
    btn.textContent = btn.classList.contains('acknowledged') ? 'Acknowledged' : 'Got it';
    return;
  }
  const commentBtn = e.target.closest('.btn-comment');
  if (commentBtn) {
    const container = commentBtn.closest('.update-item');
    const comments = container.querySelector('.comments');
    const text = prompt('Add a comment:');
    if (text) {
      const c = document.createElement('div');
      c.className = 'comment';
      c.textContent = `${(currentUser && currentUser.name)||'You'}: ${text}`;
      comments.style.display = 'block';
      comments.appendChild(c);
      showToast('Comment added', 'success');
    }
    return;
  }
  const calendarBtn = e.target.closest('.btn-add-calendar');
  if (calendarBtn) {
    showToast('Added to calendar', 'success');
    return;
  }
  const joinBtn = e.target.closest('.btn-join');
  if (joinBtn) {
    showToast('Joining meeting...', 'info');
    window.open('about:blank','_blank');
    return;
  }
  const emoji = e.target.closest('.emoji');
  if (emoji) {
    const reaction = emoji.textContent;
    showToast('Reacted', 'info', `You reacted ${reaction}`);
  }
});

// Filters
['filterMeetings','filterAnnouncements','filterActivity'].forEach(id=>{
  document.getElementById(id)?.addEventListener('change', function(){
    document.querySelectorAll('#updatesFeed .update-item').forEach(item=>{
      const type = item.dataset.type;
      const showMeeting = document.getElementById('filterMeetings')?.checked;
      const showAnnouncement = document.getElementById('filterAnnouncements')?.checked;
      const showActivity = document.getElementById('filterActivity')?.checked;
      if ((type==='meeting' && !showMeeting) || (type==='announcement' && !showAnnouncement) || (type==='activity' && !showActivity)) {
        item.style.display = 'none';
      } else {
        item.style.display = '';
      }
    });
  });
});

// Interactive Cards
document.addEventListener('click', function(e) {
  if (e.target.closest('.service-card, .action-card, .stat-card')) {
    const card = e.target.closest('.service-card, .action-card, .stat-card');
    const title = card.querySelector('h3, h4')?.textContent || 'Item';
    showToast('Clicked!', 'info', `You clicked: ${title}`);
  }
});

// Use event delegation for notification items and buttons
document.getElementById('notificationsList')?.addEventListener('click', function(e) {
  // Handle clicks on notification items (mark as read)
  if (e.target.closest('.notification-item') && !e.target.closest('.btn-small')) {
    const notification = e.target.closest('.notification-item');
    notification.classList.remove('unread');
    updateNotificationBadge();
  }
  
  // Handle clicks on action buttons
  if (e.target.closest('.btn-small')) {
    e.stopPropagation();
    const button = e.target.closest('.btn-small');
    const notification = button.closest('.notification-item');
    const action = button.textContent.toLowerCase();
    
    if (action === 'dismiss') {
      notification.remove();
      updateNotificationBadge();
      showToast('Notification Dismissed', 'info');
    } else {
      showToast(`Action: ${action}`, 'info', `Performing ${action} action`);
    }
  }
});

// Notification Control Buttons
document.addEventListener('click', function(e) {
  if (e.target.id === 'markAllRead') {
    document.querySelectorAll('.notification-item.unread').forEach(item => {
      item.classList.remove('unread');
    });
    updateNotificationBadge();
    showToast('All notifications marked as read', 'success');
  } else if (e.target.id === 'clearAll') {
    document.querySelectorAll('.notification-item').forEach(item => {
      item.remove();
    });
    const badge = document.querySelector('#notificationBtn .notification-badge');
    if (badge) {
      badge.textContent = '0';
    }
    showToast('All notifications cleared', 'success');
  } else if (e.target.id === 'viewAllNotifications') {
    showToast('View All Notifications', 'info', 'Loading all notifications...');
  }
});

// Update notification badge
function updateNotificationBadge() {
  const unreadCount = document.querySelectorAll('.notification-item.unread').length;
  const badge = document.querySelector('#notificationBtn .notification-badge');
  if (!badge) return;
  badge.textContent = unreadCount;
  if (unreadCount > 0) {
    badge.classList.add('new');
  } else {
    badge.classList.remove('new');
  }
}

// Show notification with animation
function showNotification(title, message, type = 'info') {
  const notificationList = document.getElementById('notificationsList');
  const notification = document.createElement('div');
  notification.className = 'notification-item unread';
  
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  notification.innerHTML = `
    <div class="notification-header">
      <div class="notification-title">${title}</div>
      <div class="notification-time">just now</div>
    </div>
    <div class="notification-body">
      ${message}
    </div>
    <div class="notification-actions">
      <button class="btn-small">View</button>
      <button class="btn-small secondary">Dismiss</button>
    </div>
  `;
  
  if (notificationList) notificationList.prepend(notification);
  updateNotificationBadge();
  
  // Event listeners are handled via event delegation in the main notification list listener
  
  // Check if user has enabled this type of notification
  const notificationType = getNotificationType(title);
  const notificationSettings = getNotificationSettings();
  
  if (notificationSettings.enabled && 
      (notificationSettings.types.includes(notificationType) || notificationType === 'critical')) {
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: 'https://ui-avatars.com/api/?name=Z&background=0D8ABC&color=fff'
      });
    }
  }
}

// Get notification type based on title
function getNotificationType(title) {
  if (title.includes('Security') || title.includes('Alert')) return 'security';
  if (title.includes('Project') || title.includes('Task')) return 'project';
  if (title.includes('Payment') || title.includes('Invoice')) return 'finance';
  if (title.includes('System')) return 'system';
  return 'general';
}

// Get notification settings from localStorage or defaults
function getNotificationSettings() {
  const defaultSettings = {
    enabled: true,
    types: ['security', 'project', 'finance', 'system', 'general'],
    frequency: 'instant'
  };
  
  try {
    const savedSettings = localStorage.getItem('notificationSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notifications Enabled', 'success', 'You will now receive browser notifications');
      } else {
        showToast('Notifications Blocked', 'warning', 'You may miss important updates');
      }
    });
  }
}

// Simulate periodic notifications
function simulatePeriodicNotifications() {
  // Request permission on first load
  if (localStorage.getItem('notificationPermissionRequested') !== 'true') {
    setTimeout(requestNotificationPermission, 3000);
    localStorage.setItem('notificationPermissionRequested', 'true');
  }
  
  // Periodically send notifications
  setInterval(() => {
    const notifications = [
      { title: '📅 Reminder', message: 'Your weekly team meeting starts in 30 minutes', type: 'project' },
      { title: '📈 Performance Update', message: 'Your latest project is performing 15% above average', type: 'project' },
      { title: '💡 Tip of the Day', message: 'Did you know you can customize your dashboard layout?', type: 'general' },
      { title: '🎉 Achievement Unlocked', message: 'You have completed 100 tasks this month!', type: 'project' }
    ];
    
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    
    // Only show if user has enabled general notifications
    const settings = getNotificationSettings();
    if (settings.enabled && settings.types.includes(randomNotification.type)) {
      showNotification(randomNotification.title, randomNotification.message);
    }
  }, 60000); // Every minute for demo purposes
}

// Manager permissions
const MANAGER_PERMISSIONS = {
  editAnyContent: ['Project Manager','Admin'],
  addAnyContent: ['Project Manager','Admin'],
  removeAnyContent: ['Project Manager','Admin'],
  editRole: ['Project Manager']
};

// Check if user has permission for an action
function hasManagerPermission(action) {
  if (!currentUser) return false;
  return currentUser.role && (MANAGER_PERMISSIONS[action] || []).includes(currentUser.role);
}

// Manager editing functionality
function enableManagerEditing() {
  if (!hasManagerPermission('editAnyContent')) return;
  
  // Add edit buttons to all content
  addEditButtonsToContent();
  
  // Enable drag and drop for reordering
  enableDragAndDrop();
  
  // Add context menu for managers
  addContextMenu();
}

// Add edit buttons to all content
function addEditButtonsToContent() {
  // Add edit buttons to all major content sections
  const contentElements = document.querySelectorAll(
    '.hero-section, .action-card, .service-card, .stat-card, .culture-card, .achievement-card, .team-member'
  );
  
  contentElements.forEach(function(element) {
    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'manager-edit-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit this content';
    editBtn.onclick = function() {
      openEditModal(element);
    };
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'manager-delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete this content';
    deleteBtn.onclick = function() {
      deleteContent(element);
    };
    
    // Create container for buttons
    const btnContainer = document.createElement('div');
    btnContainer.className = 'manager-controls';
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    
    // Add the container to the element
    element.style.position = 'relative';
    element.appendChild(btnContainer);
  });
}

// Open edit modal for content
function openEditModal(element) {
  const content = element.innerHTML;
  
  // Create modal for editing
  let modal = document.getElementById('managerEditModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'managerEditModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="width: 80%; max-width: 800px;">
        <div class="modal-header">
          <h2>Edit Content</h2>
          <button class="close-modal" id="closeManagerEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <textarea id="editContentArea" style="width: 100%; height: 300px; padding: 10px; font-family: monospace;"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="cancelManagerEdit">Cancel</button>
          <button class="btn-primary" id="saveManagerEdit">Save Changes</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Set current content in the textarea
  document.getElementById('editContentArea').value = content;
  
  // Store reference to the element being edited
  modal.dataset.editingElement = element;
  
  // Show the modal
  modal.classList.add('active');
  
  // Add event listeners for the modal
  document.getElementById('closeManagerEditModal').onclick = function() {
    modal.classList.remove('active');
  };
  
  document.getElementById('cancelManagerEdit').onclick = function() {
    modal.classList.remove('active');
  };
  
  document.getElementById('saveManagerEdit').onclick = function() {
    const newContent = document.getElementById('editContentArea').value;
    element.innerHTML = newContent;
    modal.classList.remove('active');
    showToast('Content Updated', 'success', 'Content has been updated successfully');
  };
}

// Delete content
function deleteContent(element) {
  if (confirm('Are you sure you want to delete this content?')) {
    element.remove();
    showToast('Content Deleted', 'info', 'Content has been removed');
  }
}

// Enable drag and drop for reordering
function enableDragAndDrop() {
  if (!hasManagerPermission('editAnyContent')) return;
  
  const draggables = document.querySelectorAll('.action-card, .service-card, .stat-card, .culture-card, .achievement-card');
  const containers = document.querySelectorAll('.action-grid, .services-grid, .stats-grid, .culture-grid, .achievements-grid');
  
  draggables.forEach(draggable => {
    draggable.setAttribute('draggable', true);
    
    draggable.addEventListener('dragstart', function() {
      this.classList.add('dragging');
    });
    
    draggable.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
  });
  
  containers.forEach(container => {
    container.addEventListener('dragover', function(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}

// Helper function for drag and drop
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.action-card:not(.dragging), .service-card:not(.dragging), .stat-card:not(.dragging), .culture-card:not(.dragging), .achievement-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Add context menu for managers
function addContextMenu() {
  if (!hasManagerPermission('editAnyContent')) return;
  
  document.addEventListener('contextmenu', function(e) {
    // Check if we're on content that can be managed
    const contentElement = e.target.closest('.hero-section, .action-card, .service-card, .stat-card, .culture-card, .achievement-card, .team-member');
    
    if (contentElement) {
      e.preventDefault();
      
      // Create context menu
      let menu = document.getElementById('managerContextMenu');
      if (menu) menu.remove();
      
      menu = document.createElement('div');
      menu.id = 'managerContextMenu';
      menu.className = 'context-menu';
      menu.style.position = 'absolute';
      menu.style.left = e.pageX + 'px';
      menu.style.top = e.pageY + 'px';
      menu.style.backgroundColor = '#1a1a2e';
      menu.style.border = '1px solid #00d4ff';
      menu.style.borderRadius = '4px';
      menu.style.padding = '5px 0';
      menu.style.zIndex = '10000';
      menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      menu.innerHTML = `
        <div class="context-menu-item" id="editContent">Edit Content</div>
        <div class="context-menu-item" id="deleteContent">Delete Content</div>
        <div class="context-menu-item" id="duplicateContent">Duplicate Content</div>
      `;
      
      document.body.appendChild(menu);
      
      // Add event listeners
      document.getElementById('editContent').onclick = function() {
        openEditModal(contentElement);
        menu.remove();
      };
      
      document.getElementById('deleteContent').onclick = function() {
        deleteContent(contentElement);
        menu.remove();
      };
      
      document.getElementById('duplicateContent').onclick = function() {
        duplicateContent(contentElement);
        menu.remove();
      };
      
      // Remove menu when clicking elsewhere
      document.addEventListener('click', function removeMenu() {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      });
    }
  });
}

// Duplicate content
function duplicateContent(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.insertBefore(newElement, element.nextSibling);
  
  // Re-enable manager controls for the new element
  if (hasManagerPermission('editAnyContent')) {
    addEditButtonsToContent();
  }
  
  showToast('Content Duplicated', 'success', 'Content has been duplicated');
}

// Add manager toolbar
function addManagerToolbar() {
  if (!hasManagerPermission('addAnyContent')) return;
  
  // Create toolbar
  let toolbar = document.getElementById('managerToolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'managerToolbar';
    toolbar.innerHTML = `
      <div class="toolbar-btn" title="Add New Section" id="addNewSection">➕ Section</div>
      <div class="toolbar-btn" title="Add New Hero" id="addNewHero">➕ Hero</div>
      <div class="toolbar-btn" title="Add New Card" id="addNewCard">➕ Card</div>
      <div class="toolbar-btn" title="Add New Feature" id="addNewFeature">➕ Feature</div>
    `;
    toolbar.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #000;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toolbar);
  }
  
  // Add event listeners
  document.getElementById('addNewSection').onclick = function() {
    addNewSection();
  };
  
  document.getElementById('addNewHero').onclick = function() {
    addNewHero();
  };
  
  document.getElementById('addNewCard').onclick = function() {
    addNewCard();
  };
  
  document.getElementById('addNewFeature').onclick = function() {
    addNewFeature();
  };
}

// Add new section
function addNewSection() {
  const sectionName = prompt('Enter section name:');
  if (sectionName) {
    const newSection = document.createElement('div');
    newSection.className = 'section';
    newSection.innerHTML = `
      <h2>${sectionName}</h2>
      <p>New section content...</p>
    `;
    document.body.appendChild(newSection);
    showToast('Section Added', 'success', 'New section has been added');
  }
}

// Add new hero section
function addNewHero() {
  const heroTitle = prompt('Enter hero title:');
  if (heroTitle) {
    const newHero = document.createElement('div');
    newHero.className = 'hero-section';
    newHero.innerHTML = `
      <div class="hero-content">
        <h1>${heroTitle}</h1>
        <p>New hero section content...</p>
        <button class="btn-primary">Get Started</button>
      </div>
    `;
    document.body.appendChild(newHero);
    showToast('Hero Section Added', 'success', 'New hero section has been added');
  }
}

// Add new card
function addNewCard() {
  const cardTitle = prompt('Enter card title:');
  if (cardTitle) {
    // Find a grid container or create one
    let grid = document.querySelector('.action-grid, .services-grid, .stats-grid, .culture-grid, .achievements-grid');
    if (!grid) {
      const gridSection = document.createElement('div');
      gridSection.className = 'content-grid';
      gridSection.innerHTML = '<div class="action-grid"></div>';
      document.body.appendChild(gridSection);
      grid = document.querySelector('.action-grid');
    }
    
    const newCard = document.createElement('div');
    newCard.className = 'action-card';
    newCard.innerHTML = `
      <div class="card-icon">⚙️</div>
      <h3>${cardTitle}</h3>
      <p>New card content...</p>
    `;
    grid.appendChild(newCard);
    
    // Add manager controls to the new card
    if (hasManagerPermission('editAnyContent')) {
      addEditButtonsToContent();
    }
    
    showToast('Card Added', 'success', 'New card has been added');
  }
}

// Add new feature
function addNewFeature() {
  const featureTitle = prompt('Enter feature title:');
  if (featureTitle) {
    // Find the services section or create one
    let servicesSection = document.querySelector('.services-section');
    if (!servicesSection) {
      servicesSection = document.createElement('div');
      servicesSection.className = 'services-section';
      servicesSection.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Our Services</h2>
        </div>
        <div class="services-grid"></div>
      `;
      document.body.appendChild(servicesSection);
    }
    
    const servicesGrid = servicesSection.querySelector('.services-grid');
    const newFeature = document.createElement('div');
    newFeature.className = 'service-card';
    newFeature.innerHTML = `
      <div class="card-icon">✨</div>
      <h3>${featureTitle}</h3>
      <p>New feature description...</p>
    `;
    servicesGrid.appendChild(newFeature);
    
    // Add manager controls to the new feature
    if (hasManagerPermission('editAnyContent')) {
      addEditButtonsToContent();
    }
    
    showToast('Feature Added', 'success', 'New feature has been added');
  }
}

// Apply manager functionality on page load
function applyManagerFeatures() {
  if (hasManagerPermission('editAnyContent')) {
    // Add edit buttons to existing content
    setTimeout(addEditButtonsToContent, 1000); // Wait for content to load
    
    // Add manager toolbar
    addManagerToolbar();
    
    // Add context menu
    addContextMenu();
    
    // Enable drag and drop
    enableDragAndDrop();
    
    // Add CSS for manager controls
    addManagerStyles();
  }
}

// Add CSS styles for manager controls
function addManagerStyles() {
  let style = document.getElementById('managerStyles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'managerStyles';
    style.textContent = `
      .manager-controls {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        gap: 5px;
        z-index: 100;
      }
      
      .manager-edit-btn, .manager-delete-btn {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: 1px solid #00d4ff;
        border-radius: 3px;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .manager-edit-btn:hover, .manager-delete-btn:hover {
        background: rgba(0, 212, 255, 0.3);
      }
      
      .dragging {
        opacity: 0.5;
      }
      
      .context-menu {
        position: absolute;
        background: #1a1a2e;
        border: 1px solid #00d4ff;
        border-radius: 4px;
        padding: 5px 0;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .context-menu-item {
        padding: 8px 15px;
        cursor: pointer;
        color: #f0f0f0;
        font-size: 14px;
      }
      
      .context-menu-item:hover {
        background: rgba(0, 212, 255, 0.3);
      }
      
      .toolbar-btn {
        padding: 8px 12px;
        background: #333;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        text-align: center;
        border: 1px solid #00d4ff;
      }
      
      .toolbar-btn:hover {
        background: #00d4ff;
        color: black;
      }
    `;
    document.head.appendChild(style);
  }
}

// Apply manager features when user logs in
function onUserLogin() {
  applyManagerFeatures();
}

// Apply manager features when page loads and user is already logged in
if (currentUser) {
  applyManagerFeatures();
}

// Start periodic notifications
simulatePeriodicNotifications();