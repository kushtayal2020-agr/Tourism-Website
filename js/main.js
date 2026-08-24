/* ==========================================================================
   AZURA TOURISM PLATFORM — SHARED APPLICATION SCRIPTS
   ========================================================================== */

/* Navbar Scroll Effect */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
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
const lb = document.getElementById('lightbox');
if (lb) {
  lb.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
}

/* Toast Notifications */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
}

/* Booking Modal Logic */
let currentBookingItem = { name: "Santorini Escape", dur: "6 Days / 5 Nights", price: 1890 };

function openBooking() {
  openBookingFor(currentBookingItem.name, currentBookingItem.dur, currentBookingItem.price);
}

function openBookingFor(name, dur, price) {
  currentBookingItem = { name, dur, price };
  const sumPkg = document.getElementById('sumPkg');
  const sumDur = document.getElementById('sumDur');
  const sumBase = document.getElementById('sumBase');
  const sumTotal = document.getElementById('sumTotal');
  const refCode = document.getElementById('refCode');
  
  if (sumPkg) sumPkg.textContent = name;
  if (sumDur) sumDur.textContent = dur || "5 Days / 4 Nights";
  if (sumBase) sumBase.textContent = '$' + Number(price).toLocaleString();
  if (sumTotal) sumTotal.textContent = '$' + (Number(price) + 142).toLocaleString();
  if (refCode) refCode.textContent = 'AZ-' + Math.floor(100000 + Math.random() * 899999);
  
  goStep(1);
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeBooking() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

const bookingModalElem = document.getElementById('bookingModal');
if (bookingModalElem) {
  bookingModalElem.addEventListener('click', (e) => {
    if (e.target.id === 'bookingModal') closeBooking();
  });
}

function goStep(n) {
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
  } else {
    if (title) title.textContent = 'Complete Your Booking';
    if (sub) sub.innerHTML = 'Step <span id="stepNum">' + n + '</span> of 3';
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
});
