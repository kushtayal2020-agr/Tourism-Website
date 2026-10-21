/* ==========================================================================
   AZURA — DESTINATIONS CATALOG CONTROLLER
   ========================================================================== */

let catalogState = {
  search: '',
  country: 'all',
  category: 'all',
  maxPrice: 3000,
  minRating: 0,
  sortBy: 'recommended',
  viewMode: 'grid',
  page: 1,
  pageSize: 6
};

function renderCatalog() {
  const container = document.getElementById('destCatalogGrid');
  if (!container) return;

  // Show skeleton loading state
  showSkeletonLoading(container);

  setTimeout(() => {
    // 1. Filter Data
    let list = DESTINATIONS_DATA.filter(item => {
      // Search keyword
      if (catalogState.search) {
        const q = catalogState.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCountry = item.country.toLowerCase().includes(q);
        const matchesOverview = item.overview.toLowerCase().includes(q);
        if (!matchesName && !matchesCountry && !matchesOverview) return false;
      }
      // Country
      if (catalogState.country !== 'all' && item.country.toLowerCase() !== catalogState.country.toLowerCase()) {
        return false;
      }
      // Category
      if (catalogState.category !== 'all' && item.tag.toLowerCase() !== catalogState.category.toLowerCase()) {
        return false;
      }
      // Price
      if (item.price > catalogState.maxPrice) {
        return false;
      }
      // Rating
      if (item.rating < catalogState.minRating) {
        return false;
      }
      return true;
    });

    // 2. Sort Data
    if (catalogState.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (catalogState.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (catalogState.sortBy === 'rating-desc') {
      list.sort((a, b) => b.rating - a.rating);
    }

    // 3. Update Result Count & Active Chips
    const countDisplay = document.getElementById('resultCountNum');
    if (countDisplay) countDisplay.textContent = list.length;
    renderActiveFilterChips();

    // 4. Handle Empty State
    if (list.length === 0) {
      container.className = 'no-results';
      container.innerHTML = `
        <div class="no-results-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>
        <h3>No Destinations Found</h3>
        <p>We couldn't find any destinations matching your current filter criteria. Try adjusting your search or filters.</p>
        <button class="btn btn-primary btn-sm" onclick="resetAllFilters()">Reset All Filters</button>
      `;
      renderPagination(0);
      return;
    }

    // 5. Paginate
    const totalPages = Math.ceil(list.length / catalogState.pageSize);
    if (catalogState.page > totalPages) catalogState.page = 1;
    const startIndex = (catalogState.page - 1) * catalogState.pageSize;
    const paginatedList = list.slice(startIndex, startIndex + catalogState.pageSize);

    // 6. Render Items according to viewMode
    container.className = `dest-grid ${catalogState.viewMode === 'list' ? 'dest-list' : ''}`;
    
    if (catalogState.viewMode === 'grid') {
      container.innerHTML = paginatedList.map(d => `
        <div class="dest-card reveal visible" onclick="window.location.href='destination-details.html?id=${d.id}'">
          <img src="${uns(d.img, 700, 75)}" alt="${d.name}, ${d.country}" loading="lazy">
          <div class="overlay"></div>
          <span class="dest-tag">${d.tag}</span>
          <button class="wishlist-btn" onclick="event.stopPropagation();toggleWishlist(this)" aria-label="Add to wishlist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.5l-1-.9a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>
          <div class="dest-info">
            <div class="row-top">
              <div><h3>${d.name}</h3><div class="country">${d.country}</div></div>
              <div class="dest-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/></svg>${d.rating}</div>
            </div>
            <div class="dest-price">From <b>$${d.price.toLocaleString()}</b> / person</div>
          </div>
        </div>
      `).join('');
    } else {
      // List Mode
      container.innerHTML = paginatedList.map(d => `
        <div class="dest-card reveal visible" onclick="window.location.href='destination-details.html?id=${d.id}'">
          <img src="${uns(d.img, 600, 75)}" alt="${d.name}" loading="lazy">
          <div class="dest-info">
            <div>
              <div class="row-top">
                <div><h3>${d.name}</h3><div class="country">${d.country} · <span class="dest-tag" style="position:static;display:inline-block;padding:2px 10px;margin-left:6px;">${d.tag}</span></div></div>
                <div class="dest-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/></svg>${d.rating} (${d.reviewsCount} reviews)</div>
              </div>
              <p style="font-size:14px;color:var(--muted);margin-top:10px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${d.overview}</p>
            </div>
            <div class="dest-list-actions">
              <div class="dest-price">Starting from <b>$${d.price.toLocaleString()}</b> / person</div>
              <div style="display:flex;gap:10px;">
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();window.location.href='destination-details.html?id=${d.id}'">View Details</button>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openBookingFor('${d.name}','${d.idealDuration}',${d.price})">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }

    renderPagination(totalPages);
  }, 250);
}

function showSkeletonLoading(container) {
  container.className = 'dest-grid';
  container.innerHTML = Array(6).fill(0).map(() => `
    <div style="height:360px;" class="skeleton"></div>
  `).join('');
}

function renderActiveFilterChips() {
  const chipContainer = document.getElementById('activeFilterChips');
  if (!chipContainer) return;
  
  let chips = [];
  if (catalogState.search) {
    chips.push(`Search: "${catalogState.search}" <button onclick="clearSearchFilter()">×</button>`);
  }
  if (catalogState.country !== 'all') {
    chips.push(`Country: ${catalogState.country} <button onclick="clearCountryFilter()">×</button>`);
  }
  if (catalogState.category !== 'all') {
    chips.push(`Category: ${catalogState.category} <button onclick="clearCategoryFilter()">×</button>`);
  }
  if (catalogState.maxPrice < 3000) {
    chips.push(`Max Budget: $${catalogState.maxPrice.toLocaleString()} <button onclick="clearPriceFilter()">×</button>`);
  }
  if (catalogState.minRating > 0) {
    chips.push(`Rating: ${catalogState.minRating}+ <button onclick="clearRatingFilter()">×</button>`);
  }
  
  chipContainer.innerHTML = chips.map(c => `<span class="chip-item">${c}</span>`).join('');
}

function renderPagination(totalPages) {
  const pagElem = document.getElementById('catalogPagination');
  if (!pagElem) return;
  
  if (totalPages <= 1) {
    pagElem.innerHTML = '';
    return;
  }
  
  let html = `<button class="page-btn" ${catalogState.page === 1 ? 'disabled' : ''} onclick="changePage(${catalogState.page - 1})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${catalogState.page === i ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${catalogState.page === totalPages ? 'disabled' : ''} onclick="changePage(${catalogState.page + 1})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>`;
  
  pagElem.innerHTML = html;
}

function changePage(p) {
  catalogState.page = p;
  renderCatalog();
  document.getElementById('destCatalogSection').scrollIntoView({ behavior: 'smooth' });
}

function resetAllFilters() {
  catalogState.search = '';
  catalogState.country = 'all';
  catalogState.category = 'all';
  catalogState.maxPrice = 3000;
  catalogState.minRating = 0;
  catalogState.sortBy = 'recommended';
  catalogState.page = 1;
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const countrySelect = document.getElementById('countrySelect');
  if (countrySelect) countrySelect.value = 'all';
  const budgetSelect = document.getElementById('budgetSelect');
  if (budgetSelect) budgetSelect.value = '3000';
  const ratingSelect = document.getElementById('ratingSelect');
  if (ratingSelect) ratingSelect.value = '0';
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'recommended';
  
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === 'all'));
  renderCatalog();
}

function clearSearchFilter() { catalogState.search = ''; const el = document.getElementById('searchInput'); if (el) el.value = ''; renderCatalog(); }
function clearCountryFilter() { catalogState.country = 'all'; const el = document.getElementById('countrySelect'); if (el) el.value = 'all'; renderCatalog(); }
function clearCategoryFilter() { catalogState.category = 'all'; document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === 'all')); renderCatalog(); }
function clearPriceFilter() { catalogState.maxPrice = 3000; const el = document.getElementById('budgetSelect'); if (el) el.value = '3000'; renderCatalog(); }
function clearRatingFilter() { catalogState.minRating = 0; const el = document.getElementById('ratingSelect'); if (el) el.value = '0'; renderCatalog(); }

function setViewMode(mode) {
  catalogState.viewMode = mode;
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === mode));
  renderCatalog();
}

document.addEventListener('DOMContentLoaded', () => {
  // Search input listener
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      catalogState.search = e.target.value;
      catalogState.page = 1;
      renderCatalog();
    });
  }

  // Country select listener
  const countrySelect = document.getElementById('countrySelect');
  if (countrySelect) {
    countrySelect.addEventListener('change', (e) => {
      catalogState.country = e.target.value;
      catalogState.page = 1;
      renderCatalog();
    });
  }

  // Budget select listener
  const budgetSelect = document.getElementById('budgetSelect');
  if (budgetSelect) {
    budgetSelect.addEventListener('change', (e) => {
      catalogState.maxPrice = Number(e.target.value);
      catalogState.page = 1;
      renderCatalog();
    });
  }

  // Rating select listener
  const ratingSelect = document.getElementById('ratingSelect');
  if (ratingSelect) {
    ratingSelect.addEventListener('change', (e) => {
      catalogState.minRating = Number(e.target.value);
      catalogState.page = 1;
      renderCatalog();
    });
  }

  // Sort select listener
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogState.sortBy = e.target.value;
      renderCatalog();
    });
  }

  // Category Pills
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      catalogState.category = pill.dataset.cat;
      catalogState.page = 1;
      renderCatalog();
    });
  });

  // URL search params pre-fill (e.g. destinations.html?search=bali)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('search')) {
    catalogState.search = urlParams.get('search');
    if (searchInput) searchInput.value = catalogState.search;
  }
  if (urlParams.has('category')) {
    catalogState.category = urlParams.get('category');
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === catalogState.category));
  }

  renderCatalog();
  syncDestinationsFromAPI();
});

// Sync live destinations from MySQL database if API is available
async function syncDestinationsFromAPI() {
  try {
    const res = await fetch('/api/destinations');
    if (!res.ok) return;
    const result = await res.json();
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      let added = false;
      result.data.forEach(dbItem => {
        const slug = dbItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const existing = DESTINATIONS_DATA.find(d => d.id === slug || d.name.toLowerCase() === dbItem.name.toLowerCase());
        if (!existing) {
          DESTINATIONS_DATA.push({
            id: slug,
            name: dbItem.name,
            country: dbItem.country,
            tag: "Culture",
            rating: parseFloat(dbItem.rating) || 4.5,
            reviewsCount: 88,
            price: parseFloat(dbItem.price) || 950,
            img: "photo-1506744038136-46273834b3fb",
            overview: dbItem.description || `${dbItem.name} in ${dbItem.country} offers stunning attractions, local hospitality, and unforgettable cultural sights.`,
            highlights: ["Guided historic landmarks tour", "Local cuisine & delicacies", "Scenic photography points"]
          });
          added = true;
        }
      });
      if (added) {
        renderCatalog();
      }
    }
  } catch (_) {
    // Static mode works smoothly
  }
}

