/* ==========================================================================
   AZURA TOURISM PLATFORM — SHARED APPLICATION SCRIPTS
   ========================================================================== */

/* Navbar Scroll Effect */
const mainAppNav = document.getElementById('navbar');
if (mainAppNav) {
  window.addEventListener('scroll', () => {
    mainAppNav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* Mobile Menu Toggle */
function toggleMobileMenu(open) {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
}

/* Wishlist Button Toggle */
function toggleWishlist(btn) {
  if (!btn) return;
  btn.classList.toggle('active');
  const isWishlisted = btn.classList.contains('active');
  showToast(isWishlisted ? 'Added to your wishlist' : 'Removed from wishlist');
}

/* Lightbox Popup */
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (lightbox && img) {
    img.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
}
const mainLightboxElem = document.getElementById('lightbox');
if (mainLightboxElem) {
  mainLightboxElem.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
}

/* Toast Notifications */
let mainToastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(mainToastTimer);
    mainToastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
}

/* Booking Modal Logic */
let currentBookingItem = { name: "Santorini Escape", dur: "6 Days / 5 Nights", price: 1890 };

function openBooking() {
  openBookingFor(currentBookingItem.name, currentBookingItem.dur, currentBookingItem.price, currentBookingItem.package_id);
}

function openBookingFor(name, dur, price, package_id) {
  currentBookingItem = {
    name: name || "Santorini Escape",
    dur: dur || "6 Days / 5 Nights",
    price: Number(price) || 1890,
    package_id: package_id || null
  };

  // ── AUTHENTICATE BEFORE BOOK NOW ──
  const user = getAzuraCurrentUser();
  if (!user) {
    sessionStorage.setItem('azuraPendingBooking', JSON.stringify(currentBookingItem));
    showAuthRequiredModal();
    return;
  }

  const modal = document.getElementById('bookingModal');
  if (!modal) {
    sessionStorage.setItem('azuraPendingBooking', JSON.stringify(currentBookingItem));
    sessionStorage.setItem('azuraResumedBooking', JSON.stringify(currentBookingItem));
    window.location.href = 'index.html?resumeBooking=1';
    return;
  }

  // Restore wizard body if it was swapped by auth required panel
  if (modal.dataset.originalBody) {
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.innerHTML = modal.dataset.originalBody;
    const modalSteps = modal.querySelector('.modal-steps');
    if (modalSteps) modalSteps.style.display = 'flex';
    const modalTitle = document.getElementById('bookingTitle');
    const modalSub = document.getElementById('bookingSub');
    if (modalTitle) modalTitle.textContent = 'Complete Your Booking';
    if (modalSub) modalSub.innerHTML = 'Step <span id="stepNum">1</span> of 3';
  }

  const sumPkg = document.getElementById('sumPkg');
  const sumDur = document.getElementById('sumDur');
  const refCode = document.getElementById('refCode');
  
  if (sumPkg) sumPkg.textContent = currentBookingItem.name;
  if (sumDur) sumDur.textContent = currentBookingItem.dur;
  if (refCode) refCode.textContent = 'AZ-' + Math.floor(100000 + Math.random() * 899999);
  
  // Auto-fill logged-in user profile details
  const fName = document.getElementById('bookFirstName');
  const lName = document.getElementById('bookLastName');
  const email = document.getElementById('bookEmail');
  const phone = document.getElementById('bookPhone');

  if (fName && !fName.value) {
    const parts = (user.name || '').split(' ');
    fName.value = parts[0] || '';
    if (lName && parts.length > 1) lName.value = parts.slice(1).join(' ');
  }
  if (email && !email.value) email.value = user.email || '';
  if (phone && !phone.value && user.phone) phone.value = user.phone;

  // Set default travel date (7 days from now, min today)
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (!dateInput.value) {
      const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      dateInput.value = defaultDate;
    }
  }

  updateBookingCalculation();
  goStep(1);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showAuthRequiredModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) {
    showToast('Please sign in to book this journey');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return;
  }

  const modalSteps = modal.querySelector('.modal-steps');
  const modalTitle = document.getElementById('bookingTitle');
  const modalSub = document.getElementById('bookingSub');
  const modalBody = modal.querySelector('.modal-body');

  if (modalSteps) modalSteps.style.display = 'none';
  if (modalTitle) modalTitle.textContent = 'Sign In to Reserve';
  if (modalSub) modalSub.textContent = 'Account Verification Required';

  if (!modal.dataset.originalBody && modalBody) {
    modal.dataset.originalBody = modalBody.innerHTML;
  }

  if (modalBody) {
    modalBody.innerHTML = `
      <div class="auth-required-panel" style="text-align:center;padding:4px 0 12px;">
        <!-- Luxury Selected Journey Preview Card -->
        <div style="background:linear-gradient(135deg, #0F172A 0%, #1E293B 100%);border-radius:18px;padding:18px 20px;margin-bottom:24px;text-align:left;box-shadow:0 12px 30px -10px rgba(15,23,42,0.3);border:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Selected Journey</span>
            <span style="font-size:12px;color:var(--gold);font-weight:700;background:rgba(251,191,36,0.15);padding:3px 10px;border-radius:100px;border:1px solid rgba(251,191,36,0.25);">${currentBookingItem.dur || '6 Days / 5 Nights'}</span>
          </div>
          <div style="font-size:20px;font-weight:800;color:#FFFFFF;margin-bottom:6px;letter-spacing:-0.01em;">${currentBookingItem.name || 'Santorini Escape'}</div>
          <div style="font-size:14px;color:#CBD5E1;display:flex;align-items:baseline;gap:6px;">
            <span>Package Rate:</span>
            <b style="color:var(--gold);font-size:17px;font-weight:800;">$${Number(currentBookingItem.price || 1890).toLocaleString()}</b>
            <span style="font-size:12.5px;color:#94A3B8;">/ traveler</span>
          </div>
        </div>

        <!-- Security / Verification Icon -->
        <div style="width:68px;height:68px;border-radius:50%;background:#FEF3C7;color:#D97706;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid #FDE68A;box-shadow:0 10px 25px -5px rgba(245,158,11,0.25);">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><polyline points="9 12 11 14 15 10"/></svg>
        </div>
        
        <h3 style="font-size:21px;font-weight:800;color:#0F172A;margin-bottom:8px;letter-spacing:-0.01em;">Sign In to Complete Booking</h3>
        <p style="color:#64748B;font-size:14px;line-height:1.55;max-width:390px;margin:0 auto 22px;">
          To ensure verified records in MySQL, track itineraries, and manage flights & hotels in your Traveler Dashboard, an active account is required before booking.
        </p>

        <!-- Direct Actions -->
        <div style="display:flex;flex-direction:column;gap:10px;max-width:340px;margin:0 auto;">
          <a href="login.html" class="btn btn-gold btn-block" style="padding:13px 20px;font-weight:700;font-size:15px;box-shadow:0 10px 22px -5px rgba(251,191,36,0.5);border-radius:12px;">
            Sign In to Book This Trip
          </a>
          <a href="signup.html" class="btn btn-block" style="padding:12px 20px;font-weight:700;font-size:14px;background:#F8FAFC;color:#0F172A;border:1.5px solid #CBD5E1;border-radius:12px;transition:all .3s ease;" onmouseover="this.style.borderColor='#2563EB';this.style.color='#2563EB'" onmouseout="this.style.borderColor='#CBD5E1';this.style.color='#0F172A'">
            Create Free Traveler Account
          </a>
          <button type="button" class="btn btn-block" style="padding:8px;color:#94A3B8;font-size:13px;font-weight:600;background:transparent;" onmouseover="this.style.color='#475569'" onmouseout="this.style.color='#94A3B8'" onclick="closeBooking()">
            Browse More Trips
          </button>
        </div>
      </div>
    `;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateBookingCalculation() {
  const travelersInput = document.getElementById('bookTravelers');
  const count = travelersInput ? (parseInt(travelersInput.value, 10) || 1) : 1;
  const unitPrice = Number(currentBookingItem.price) || 1890;
  const base = unitPrice * count;
  const total = base + 142;

  const sumBase = document.getElementById('sumBase');
  const sumTotal = document.getElementById('sumTotal');
  if (sumBase) sumBase.textContent = '$' + base.toLocaleString();
  if (sumTotal) sumTotal.textContent = '$' + total.toLocaleString();
}

function closeBooking() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Restore wizard content if it was swapped
    if (modal.dataset.originalBody) {
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) modalBody.innerHTML = modal.dataset.originalBody;
      const modalSteps = modal.querySelector('.modal-steps');
      if (modalSteps) modalSteps.style.display = 'flex';
      const modalTitle = document.getElementById('bookingTitle');
      const modalSub = document.getElementById('bookingSub');
      if (modalTitle) modalTitle.textContent = 'Complete Your Booking';
      if (modalSub) modalSub.innerHTML = 'Step <span id="stepNum">1</span> of 3';
    }
    // Refresh user bookings if on dashboard or admin
    if (typeof loadUserBookings === 'function') loadUserBookings();
    if (typeof loadAdminBookings === 'function') loadAdminBookings();
  }
}

// Global click delegation for modal overlay & payment method buttons
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'bookingModal') {
    closeBooking();
  }
  const payBtn = e.target.closest ? e.target.closest('.pay-method') : null;
  if (payBtn) {
    document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('selected'));
    payBtn.classList.add('selected');
    const cardFields = document.getElementById('cardFields');
    if (cardFields) {
      cardFields.style.display = (payBtn.dataset.pay === 'visa' || payBtn.dataset.pay === 'mastercard') ? 'block' : 'none';
    }
  }
});

function goStep(n) {
  if (n === 2) {
    const emailInput = document.getElementById('bookEmail');
    if (emailInput && !emailInput.checkValidity()) {
      showToast('Please enter a valid email address');
      emailInput.focus();
      return;
    }
    updateBookingCalculation();
  }

  document.querySelectorAll('.m-step').forEach(s => s.classList.remove('active'));
  const targetStep = document.getElementById('step' + n);
  if (targetStep) targetStep.classList.add('active');
  
  [1, 2, 3].forEach(i => {
    const dot = document.getElementById('dot' + i);
    if (dot) {
      dot.classList.toggle('active', i === n);
      dot.classList.toggle('done', i < n);
    }
  });
  
  const stepNum = document.getElementById('stepNum');
  if (stepNum) stepNum.textContent = n;
  
  const sub = document.getElementById('bookingSub');
  const title = document.getElementById('bookingTitle');
  if (n === 3) {
    if (title) title.textContent = "You're All Set";
    if (sub) sub.innerHTML = 'Payment received';
    recordBookingToAPI();
  } else {
    if (title) title.textContent = 'Complete Your Booking';
    if (sub) sub.innerHTML = 'Step <span id="stepNum">' + n + '</span> of 3';
  }
}

async function recordBookingToAPI() {
  const token = localStorage.getItem('azuraAuthToken');
  const selectedPay = document.querySelector('.pay-method.selected');
  const payMethod = selectedPay ? (selectedPay.dataset.pay || 'Card') : 'Card';

  const travelersInput = document.getElementById('bookTravelers');
  const count = travelersInput ? (parseInt(travelersInput.value, 10) || 1) : 2;

  const dateInput = document.getElementById('bookDate');
  const dateVal = dateInput && dateInput.value ? dateInput.value : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const fName = document.getElementById('bookFirstName') ? document.getElementById('bookFirstName').value.trim() : '';
  const lName = document.getElementById('bookLastName') ? document.getElementById('bookLastName').value.trim() : '';
  const fullName = (fName + ' ' + lName).trim() || 'Guest Traveler';
  const email = document.getElementById('bookEmail') ? document.getElementById('bookEmail').value.trim() : '';
  const phone = document.getElementById('bookPhone') ? document.getElementById('bookPhone').value.trim() : '';

  const payload = {
    package_name: currentBookingItem.name || 'Santorini Escape',
    package_id: currentBookingItem.package_id || null,
    booking_date: dateVal,
    number_of_travelers: count,
    payment_method: payMethod,
    customer_name: fullName,
    customer_email: email,
    customer_phone: phone
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const refCode = document.getElementById('refCode');
      if (refCode && data.data.transaction_id) {
        refCode.textContent = data.data.transaction_id;
      }
      showToast('✓ Booking Confirmed!');
      if (typeof loadUserBookings === 'function') loadUserBookings();
      if (typeof loadAdminBookings === 'function') loadAdminBookings();
    } else {
      showToast(data.message || 'Booking completed');
    }
  } catch (err) {
    console.error('Booking error:', err);
  }
}

/* Pay Method Selection */
document.querySelectorAll('.pay-method').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const cardFields = document.getElementById('cardFields');
    if (cardFields) {
      cardFields.style.display = (btn.dataset.pay === 'visa' || btn.dataset.pay === 'mastercard') ? 'block' : 'none';
    }
  });
});

/* Intersection Observer Reveal */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* Keydown Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeBooking();
    toggleMobileMenu(false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  updateAuthNavbar();

  // Resume pending booking if returning from login/signup
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('resumeBooking') === '1') {
    const resumed = sessionStorage.getItem('azuraResumedBooking');
    if (resumed) {
      try {
        const item = JSON.parse(resumed);
        sessionStorage.removeItem('azuraResumedBooking');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          openBookingFor(item.name, item.dur, item.price, item.package_id);
        }, 350);
      } catch (_) {}
    }
  }
});

/* ==========================================================================
   DYNAMIC AUTHENTICATION NAVBAR & USER MENU
   ========================================================================== */
function getAzuraCurrentUser() {
  try {
    const raw = localStorage.getItem('azuraCurrentUser');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function updateAuthNavbar() {
  const user = getAzuraCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  const mobileActions = document.querySelector('.mobile-menu-actions');

  if (!user) {
    if (navActions && !navActions.querySelector('.nav-signin')) {
      navActions.innerHTML = `
        <a href="login.html" class="nav-signin">Sign In</a>
        <a href="signup.html" class="nav-signup">Sign Up</a>
        <button class="btn btn-gold btn-sm" onclick="openBooking()">Book Now</button>
      `;
    }
    return;
  }

  // User is logged in!
  const isAdmin = (user.role && user.role.toLowerCase() === 'admin');
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const displayName = user.name ? user.name.split(' ')[0] : (isAdmin ? 'Admin' : 'Traveler');

  // 1. Update Desktop Navbar Actions
  if (navActions) {
    navActions.innerHTML = `
      ${isAdmin ? `
        <a href="admin.html" class="nav-admin-badge" title="Go to Admin Dashboard">
          <span class="badge-dot"></span> Admin Panel
        </a>
      ` : `
        <a href="dashboard.html" class="nav-trips-btn" title="View My Bookings & Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          My Trips
        </a>
      `}
      <div class="user-profile-menu" id="userProfileMenu">
        <button class="user-pill-btn" onclick="toggleUserDropdown(event)" aria-expanded="false" title="Account Menu">
          <span class="user-avatar-circle">${initial}</span>
          <span class="user-name-text">${displayName}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="chevron-icon"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="user-dropdown-card" id="userDropdownCard">
          <div class="user-dropdown-header">
            <strong>${user.name || 'Traveler'}</strong>
            <span>${user.email || ''}</span>
            <span class="role-chip ${isAdmin ? 'admin-chip' : 'customer-chip'}">${isAdmin ? 'Administrator' : 'Verified Traveler'}</span>
          </div>
          ${isAdmin ? `
            <a href="admin.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              Admin Dashboard
            </a>
            <a href="dashboard.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Traveler View
            </a>
          ` : `
            <a href="dashboard.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              My Bookings
            </a>
            <a href="dashboard.html#profile" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </a>
          `}
          <button class="user-dropdown-item text-danger" onclick="logoutAzuraUser()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>
      <button class="btn btn-gold btn-sm" onclick="openBooking()">Book Now</button>
    `;
  }

  // 2. Update Mobile Menu Actions
  if (mobileActions) {
    mobileActions.innerHTML = `
      <div style="background:rgba(255,255,255,0.06);padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <span class="user-avatar-circle">${initial}</span>
          <div>
            <div style="font-weight:700;color:#fff;font-size:14px;">${user.name || 'Traveler'}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);">${user.email}</div>
          </div>
        </div>
        <span class="role-chip ${isAdmin ? 'admin-chip' : 'customer-chip'}">${isAdmin ? 'Administrator' : 'Verified Traveler'}</span>
      </div>
      ${isAdmin ? `
        <a href="admin.html" class="btn btn-gold btn-block">Admin Dashboard</a>
        <a href="dashboard.html" class="btn btn-ghost btn-block">Traveler View</a>
      ` : `
        <a href="dashboard.html" class="btn btn-gold btn-block">My Bookings</a>
      `}
      <button class="btn btn-outline btn-block" style="color:#F87171;border-color:rgba(248,113,113,0.4);" onclick="logoutAzuraUser()">Sign Out</button>
    `;
  }
}

function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('userProfileMenu');
  if (menu) menu.classList.toggle('open');
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userProfileMenu');
  if (menu && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});

function logoutAzuraUser() {
  localStorage.removeItem('azuraCurrentUser');
  localStorage.removeItem('azuraAuthToken');
  showToast('✓ Signed out successfully');
  setTimeout(() => {
    if (window.location.pathname.includes('admin') || window.location.pathname.includes('dashboard')) {
      window.location.href = 'index.html';
    } else {
      window.location.reload();
    }
  }, 600);
}
