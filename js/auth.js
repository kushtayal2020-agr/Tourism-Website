/* ==========================================================================
   AZURA TOURISM PLATFORM — AUTHENTICATION CONTROLLER (PRODUCTION / LIVE MYSQL)
   ========================================================================== */

let currentSignupRole = 'Customer';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getLoginEmail() {
  const emailInput = document.getElementById('loginEmail');
  return emailInput ? emailInput.value.trim() : '';
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

function setAuthRole(role) {
  const userTab = document.getElementById('userRoleTab');
  const adminTab = document.getElementById('adminRoleTab');
  const adminBadge = document.getElementById('adminBadge');
  const passkeyWrap = document.getElementById('adminPasskeyWrap');

  if (role === 'admin') {
    currentSignupRole = 'Admin';
    if (userTab) userTab.classList.remove('active');
    if (adminTab) adminTab.classList.add('active');
    if (adminBadge) adminBadge.style.display = 'flex';
    if (passkeyWrap) passkeyWrap.style.display = 'block';
  } else {
    currentSignupRole = 'Customer';
    if (userTab) userTab.classList.add('active');
    if (adminTab) adminTab.classList.remove('active');
    if (adminBadge) adminBadge.style.display = 'none';
    if (passkeyWrap) passkeyWrap.style.display = 'none';
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

async function submitLoginForm(e) {
  e.preventDefault();
  const email = getLoginEmail();
  const password = getLoginPassword();

  if (!email || !password) {
    showToast('Please enter both your email and password');
    return false;
  }

  const submitBtn = document.getElementById('authSubmitText');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) submitBtn.textContent = 'Verifying...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.success && data.user) {
      localStorage.setItem('azuraAuthToken', data.token);
      localStorage.setItem('azuraCurrentUser', JSON.stringify(data.user));
      showToast(`✓ Welcome back, ${data.user.name}!`);

      const pendingBooking = sessionStorage.getItem('azuraPendingBooking');
      if (pendingBooking && data.user.role !== 'Admin') {
        sessionStorage.removeItem('azuraPendingBooking');
        sessionStorage.setItem('azuraResumedBooking', pendingBooking);
        setTimeout(() => {
          window.location.href = 'index.html?resumeBooking=1';
        }, 650);
        return false;
      }

      setTimeout(() => {
        if (data.user.role === 'Admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 700);
      return false;
    } else {
      showToast(data.message || 'Invalid email or password.');
      if (submitBtn) submitBtn.textContent = originalText;
      return false;
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Could not reach backend server. Please verify port 5000 is running.');
    if (submitBtn) submitBtn.textContent = originalText;
    return false;
  }
}

function startEmailOtpLogin() {
  const email = normalizeEmail(getLoginEmail());

  if (!email) {
    showToast('Enter your email address first so we can generate an OTP.');
    const emailInput = document.getElementById('loginEmail');
    if (emailInput) emailInput.focus();
    return;
  }

  const otpPayload = {
    email: email,
    role: email.includes('admin') ? 'admin' : 'traveler',
    name: email.split('@')[0] || 'Traveler',
    otp: Math.floor(100000 + Math.random() * 900000).toString(),
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  sessionStorage.setItem('azuraOtpChallenge', JSON.stringify(otpPayload));
  sessionStorage.setItem('azuraOtpDestination', 'login');
  showToast(`Security code generated for ${otpPayload.email}`);
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

async function submitSignupForm(e) {
  e.preventDefault();
  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const phoneInput = document.getElementById('signupPhone');
  const pass = document.getElementById('signupPassword') ? document.getElementById('signupPassword').value : '';
  const confirmPass = document.getElementById('signupConfirmPassword') ? document.getElementById('signupConfirmPassword').value : '';
  const passkeyInput = document.getElementById('adminPasskey');
  const passkey = passkeyInput ? passkeyInput.value.trim() : '';

  if (pass !== confirmPass) {
    showToast("Passwords do not match! Please verify.");
    return false;
  }

  const name = nameInput ? nameInput.value.trim() : 'Traveler';
  const email = emailInput ? emailInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';

  const submitBtn = document.getElementById('authSubmitText');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) submitBtn.textContent = 'Creating account...';

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        password: pass,
        role: currentSignupRole,
        admin_passkey: passkey
      })
    });
    const data = await res.json();

    if (res.ok && data.success && data.user) {
      localStorage.setItem('azuraAuthToken', data.token);
      localStorage.setItem('azuraCurrentUser', JSON.stringify(data.user));
      showToast(`✓ Account created! Welcome, ${data.user.name}.`);

      const pendingBooking = sessionStorage.getItem('azuraPendingBooking');
      if (pendingBooking && data.user.role !== 'Admin') {
        sessionStorage.removeItem('azuraPendingBooking');
        sessionStorage.setItem('azuraResumedBooking', pendingBooking);
        setTimeout(() => {
          window.location.href = 'index.html?resumeBooking=1';
        }, 750);
        return false;
      }

      setTimeout(() => {
        if (data.user.role === 'Admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 900);
      return false;
    } else {
      showToast(data.message || 'Error creating account. Please check your details.');
      if (submitBtn) submitBtn.textContent = originalText;
      return false;
    }
  } catch (err) {
    console.error('Signup error:', err);
    showToast('Failed to connect to backend server. Make sure port 5000 is active.');
    if (submitBtn) submitBtn.textContent = originalText;
    return false;
  }
}

// ── Check if already logged in when visiting login or signup page ──
function checkExistingSession() {
  const raw = localStorage.getItem('azuraCurrentUser');
  if (!raw) return;

  let user = null;
  try { user = JSON.parse(raw); } catch (_) { return; }
  if (!user || !user.email) return;

  const authCard = document.querySelector('.auth-card');
  if (!authCard) return;

  const isAdmin = (user.role && user.role.toLowerCase() === 'admin');
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  authCard.innerHTML = `
    <div style="text-align:center;padding:12px 0 20px;">
      <div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#0F172A;box-shadow:0 12px 25px -8px rgba(251,191,36,0.6);">
        ${initial}
      </div>
      <h2 style="font-size:24px;font-weight:800;margin-bottom:6px;color:#fff;">You're Already Signed In</h2>
      <p style="color:rgba(255,255,255,0.72);font-size:14px;margin-bottom:14px;">
        Active session as <b style="color:#fff;">${user.name || 'Traveler'}</b><br>
        <span style="color:var(--gold);font-size:13px;">${user.email}</span>
      </p>
      <div style="display:inline-block;margin-bottom:26px;">
        <span class="role-chip ${isAdmin ? 'admin-chip' : 'customer-chip'}" style="font-size:12px;padding:5px 12px;">
          ${isAdmin ? '👑 Administrator Account' : '✈️ Verified Traveler Account'}
        </span>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;max-width:320px;margin:0 auto;">
        ${isAdmin ? `
          <a href="admin.html" class="btn btn-gold btn-block" style="padding:13px;font-weight:700;">
            Open Admin Dashboard
          </a>
        ` : `
          <a href="dashboard.html" class="btn btn-gold btn-block" style="padding:13px;font-weight:700;">
            View My Bookings & Trips
          </a>
        `}
        <a href="index.html" class="btn btn-ghost btn-block" style="padding:12px;">
          Return to Homepage
        </a>
        <button type="button" class="btn btn-outline btn-block" style="color:#F87171;border-color:rgba(248,113,113,0.35);padding:11px;" onclick="logoutAzuraUser()">
          Sign In with Different Account
        </button>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  checkExistingSession();
});
