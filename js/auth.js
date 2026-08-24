/* ==========================================================================
   AZURA TOURISM PLATFORM — AUTHENTICATION CONTROLLER
   ========================================================================== */

const AUTH_ACCOUNTS = [
  { email: 'traveler@azura.com', password: 'password123', role: 'traveler', name: 'Traveler' },
  { email: 'admin@azura.com', password: 'admin123', role: 'admin', name: 'Admin' }
];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function findAuthAccount(email) {
  const normalizedEmail = normalizeEmail(email);
  return AUTH_ACCOUNTS.find(account => account.email === normalizedEmail) || null;
}

function getLoginEmail() {
  const emailInput = document.getElementById('loginEmail');
  return emailInput ? emailInput.value : '';
}

function getLoginPassword() {
  const passInput = document.getElementById('loginPassword');
  return passInput ? passInput.value : '';
}

function setActiveAuthMode(mode) {
  const submitBtnText = document.getElementById('authSubmitText');
  if (submitBtnText) {
    submitBtnText.textContent = mode === 'otp' ? 'Send Email OTP' : 'Sign In to AZURA';
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  if (btn) {
    btn.innerHTML = isPassword ? `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    ` : `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    `;
  }
}

function fillDemoCredentials(role) {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const account = AUTH_ACCOUNTS.find(entry => entry.role === role) || AUTH_ACCOUNTS[0];

  if (emailInput) emailInput.value = account.email;
  if (passInput) passInput.value = account.password;
  showToast(`Filled ${account.role === 'admin' ? 'Admin' : 'Traveler'} demo credentials!`);
}

function submitLoginForm(e) {
  e.preventDefault();
  const email = getLoginEmail();
  const password = getLoginPassword();
  const account = findAuthAccount(email);

  if (!account || account.password !== password) {
    showToast('Invalid email or password. Please try again.');
    return false;
  }

  const sessionUser = {
    email: account.email,
    role: account.role,
    name: account.name,
    authMethod: 'password'
  };

  localStorage.setItem('azuraCurrentUser', JSON.stringify(sessionUser));
  showToast(`✓ Signed in as ${account.role}. Redirecting...`);
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
  return false;
}

function startEmailOtpLogin() {
  const email = normalizeEmail(getLoginEmail());

  if (!email) {
    showToast('Enter your email first so we can send the OTP.');
    return;
  }

  const account = findAuthAccount(email);
  const otpPayload = {
    email: account ? account.email : email,
    role: account ? account.role : (email.includes('admin') ? 'admin' : 'traveler'),
    name: account ? account.name : (email.split('@')[0] || 'Traveler'),
    otp: '123456',
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  sessionStorage.setItem('azuraOtpChallenge', JSON.stringify(otpPayload));
  sessionStorage.setItem('azuraOtpDestination', 'login');
  showToast(`OTP sent to ${otpPayload.email}. Use 123456 for this demo flow.`);
  setTimeout(() => {
    window.location.href = 'verification/emailotp.html';
  }, 900);
}

function checkPasswordStrength(input) {
  const val = input.value;
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  if (!fill || !text) return;

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  let pct = 0, color = '#EF4444', label = 'Weak';
  if (val.length === 0) {
    pct = 0; label = '';
  } else if (score <= 2) {
    pct = 25; color = '#EF4444'; label = 'Weak';
  } else if (score === 3) {
    pct = 50; color = '#F59E0B'; label = 'Fair';
  } else if (score === 4) {
    pct = 75; color = '#10B981'; label = 'Strong';
  } else {
    pct = 100; color = '#14B8A6'; label = 'Ultra-Secure';
  }

  fill.style.width = pct + '%';
  fill.style.background = color;
  text.textContent = label ? `Password strength: ${label}` : '';
  text.style.color = color;
}

function submitSignupForm(e) {
  e.preventDefault();
  const pass = document.getElementById('signupPassword') ? document.getElementById('signupPassword').value : '';
  const confirmPass = document.getElementById('signupConfirmPassword') ? document.getElementById('signupConfirmPassword').value : '';

  if (pass !== confirmPass) {
    showToast("Passwords do not match! Please verify.");
    return false;
  }

  showToast("✓ Account created! Redirecting to Sign In...");
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1400);
  return false;
}
