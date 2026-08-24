/* ==========================================================================
   AZURA — EXTRA PAGES INTERACTIVE CONTROLLERS
   ========================================================================== */

/* ==========================================================================
   1. PACKAGES PAGE CONTROLLER
   ========================================================================== */
let packageState = {
  duration: 'all',
  style: 'all',
  maxPrice: 4000
};

function renderPackagesPage() {
  const container = document.getElementById('packagesListGrid');
  if (!container) return;

  const filtered = PACKAGES_DATA.filter(p => {
    if (packageState.duration !== 'all' && p.durationCategory !== packageState.duration) return false;
    if (packageState.style !== 'all' && p.styleCategory !== packageState.style) return false;
    if (p.price > packageState.maxPrice) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="no-results" style="grid-column:1/-1;"><h3>No Packages Found</h3><p>Try adjusting your search filters.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="pkg-card reveal visible" style="margin-bottom:0;">
      <div class="pkg-media">
        <img src="${uns(p.img, 500, 75)}" alt="${p.title}" loading="lazy">
        <span class="pkg-days">${p.days}</span>
      </div>
      <div class="pkg-body">
        <div style="font-size:12px;font-weight:700;color:var(--secondary);margin-bottom:4px;">${p.destName}</div>
        <h3>${p.title}</h3>
        <p class="pkg-desc">All-inclusive luxury itinerary featuring handpicked 5-star accommodations, private transfers, and guided excursions.</p>
        <div class="pkg-meta">
          ${p.inclusions.map(inc => `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${inc}</span>`).join('')}
        </div>
        <div class="pkg-foot">
          <div class="pkg-price">Starting from<b>$${p.price.toLocaleString()}</b></div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-outline btn-sm" onclick="openItineraryModal('${p.id}')">View Itinerary</button>
            <button class="btn btn-primary btn-sm" onclick="openBookingFor('${p.title}','${p.days}',${p.price})">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function openItineraryModal(pkgId) {
  const pkg = PACKAGES_DATA.find(p => p.id === pkgId);
  if (!pkg) return;

  const modalTitle = document.getElementById('itineraryModalTitle');
  const modalSub = document.getElementById('itineraryModalSub');
  const modalTimeline = document.getElementById('itineraryTimelineContainer');

  if (modalTitle) modalTitle.textContent = pkg.title;
  if (modalSub) modalSub.textContent = `${pkg.destName} · ${pkg.days}`;

  if (modalTimeline && pkg.itinerary) {
    modalTimeline.innerHTML = pkg.itinerary.map(item => `
      <div class="itinerary-day">
        <div class="itinerary-day-num">Day ${item.day}</div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    `).join('');
  }

  const modal = document.getElementById('itineraryModalOverlay');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeItineraryModal() {
  const modal = document.getElementById('itineraryModalOverlay');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   2. EXPERIENCES PAGE CONTROLLER
   ========================================================================== */
let expCategory = 'all';

function renderExperiencesPage() {
  const container = document.getElementById('experiencesListGrid');
  if (!container) return;

  const filtered = EXPERIENCES_DATA.filter(e => expCategory === 'all' || e.category === expCategory);

  container.innerHTML = filtered.map(e => `
    <div class="exp-card reveal visible">
      <div class="exp-media">
        <img src="${uns(e.img, 600, 75)}" alt="${e.title}" loading="lazy">
        <span class="exp-duration">${e.duration}</span>
      </div>
      <div class="exp-body">
        <div class="exp-meta-row">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${e.location}</span>
          <span><svg viewBox="0 0 24 24" fill="currentColor" style="color:var(--gold);"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/></svg>${e.rating}</span>
        </div>
        <h3>${e.title}</h3>
        <p class="exp-desc">${e.desc}</p>
        <div class="exp-foot">
          <div style="font-size:12px;color:var(--muted);">From <b style="font-size:18px;color:var(--ink);">$${e.price}</b> / person</div>
          <button class="btn btn-primary btn-sm" onclick="openBookingFor('${e.title}','${e.duration}',${e.price})">Reserve</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   3. BLOG PAGE & ARTICLE MODAL
   ========================================================================== */
let blogCategory = 'all';

function renderBlogPage() {
  const container = document.getElementById('blogPostsGrid');
  if (!container) return;

  const filtered = BLOG_POSTS_DATA.filter(b => blogCategory === 'all' || b.cat.toLowerCase() === blogCategory.toLowerCase());

  container.innerHTML = filtered.map(b => `
    <div class="blog-card reveal visible" onclick="openArticleModal('${b.id}')" style="cursor:pointer;">
      <div class="blog-media"><img src="${uns(b.img, 600, 75)}" alt="${b.title}" loading="lazy"><span class="blog-cat">${b.cat}</span></div>
      <div class="blog-body">
        <div class="blog-meta"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${b.readTime}</span><span>· ${b.date}</span></div>
        <h3>${b.title}</h3>
        <p>${b.excerpt}</p>
        <div class="blog-author"><img src="${b.avatar}" alt="${b.author}"><span>${b.author}</span></div>
      </div>
    </div>
  `).join('');
}

function openArticleModal(postId) {
  const post = BLOG_POSTS_DATA.find(p => p.id === postId);
  if (!post) return;

  const titleElem = document.getElementById('articleTitle');
  const metaElem = document.getElementById('articleMeta');
  const bodyElem = document.getElementById('articleBodyText');

  if (titleElem) titleElem.textContent = post.title;
  if (metaElem) metaElem.textContent = `${post.cat} · ${post.readTime} · By ${post.author}`;
  if (bodyElem) bodyElem.innerHTML = post.content || `<p>${post.excerpt}</p>`;

  const modal = document.getElementById('articleModalOverlay');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeArticleModal() {
  const modal = document.getElementById('articleModalOverlay');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   4. CONTACT FORM & FAQ ACCORDION
   ========================================================================== */
function submitContactForm(e) {
  e.preventDefault();
  showToast("Message sent! Our concierge team will reach out shortly.");
  const form = document.getElementById('contactForm');
  if (form) form.reset();
  return false;
}

function toggleFaq(elem) {
  const item = elem.closest('.faq-item');
  if (item) {
    item.classList.toggle('open');
  }
}

function renderFaqs() {
  const container = document.getElementById('faqsAccordionContainer');
  if (!container) return;

  container.innerHTML = FAQS_DATA.map((faq, idx) => `
    <div class="faq-item ${idx === 0 ? 'open' : ''}">
      <div class="faq-question" onclick="toggleFaq(this)">
        <span>${faq.q}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="faq-answer">${faq.a}</div>
    </div>
  `).join('');
}

/* DOM Loaded Dispatcher */
document.addEventListener('DOMContentLoaded', () => {
  renderPackagesPage();
  renderExperiencesPage();
  renderBlogPage();
  renderFaqs();

  // Package Filters
  const durSelect = document.getElementById('pkgDurSelect');
  if (durSelect) {
    durSelect.addEventListener('change', (e) => {
      packageState.duration = e.target.value;
      renderPackagesPage();
    });
  }
  const styleSelect = document.getElementById('pkgStyleSelect');
  if (styleSelect) {
    styleSelect.addEventListener('change', (e) => {
      packageState.style = e.target.value;
      renderPackagesPage();
    });
  }

  // Experience Category Pills
  document.querySelectorAll('.exp-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.exp-cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      expCategory = pill.dataset.cat;
      renderExperiencesPage();
    });
  });

  // Blog Category Pills
  document.querySelectorAll('.blog-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.blog-cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      blogCategory = pill.dataset.cat;
      renderBlogPage();
    });
  });
});
