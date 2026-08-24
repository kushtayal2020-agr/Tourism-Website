/* ==========================================================================
   AZURA — DESTINATION DETAILS CONTROLLER
   ========================================================================== */

let activeDestination = null;
let bookingCalculatorState = {
  guests: 2,
  tierMultiplier: 1.0
};

function getDestinationIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'santorini';
}

function loadDestinationDetails() {
  const destId = getDestinationIdFromUrl();
  activeDestination = DESTINATIONS_DATA.find(d => d.id === destId) || DESTINATIONS_DATA[0];

  document.title = `${activeDestination.name}, ${activeDestination.country} — AZURA Travel`;

  // 1. Hero & Breadcrumbs
  const heroBg = document.getElementById('detailHeroBgImg');
  if (heroBg) heroBg.src = uns(activeDestination.img, 1600, 80);

  const breadcrumbDest = document.getElementById('breadcrumbDest');
  if (breadcrumbDest) breadcrumbDest.textContent = activeDestination.name;

  const titleElem = document.getElementById('detailTitle');
  if (titleElem) titleElem.textContent = activeDestination.name;

  const countryElem = document.getElementById('detailCountry');
  if (countryElem) countryElem.textContent = activeDestination.country;

  const tagElem = document.getElementById('detailTag');
  if (tagElem) tagElem.textContent = activeDestination.tag;

  const ratingElem = document.getElementById('detailRating');
  if (ratingElem) ratingElem.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/></svg>${activeDestination.rating} (${activeDestination.reviewsCount} reviews)`;

  const priceElem = document.getElementById('detailHeaderPrice');
  if (priceElem) priceElem.textContent = `$${activeDestination.price.toLocaleString()}`;

  // 2. Gallery Mosaic
  renderGalleryMosaic();

  // 3. Quick Info Bar
  const bestTimeElem = document.getElementById('infoBestTime');
  if (bestTimeElem) bestTimeElem.textContent = activeDestination.bestTime;

  const avgTempElem = document.getElementById('infoAvgTemp');
  if (avgTempElem) avgTempElem.textContent = activeDestination.avgTemp;

  const durationElem = document.getElementById('infoDuration');
  if (durationElem) durationElem.textContent = activeDestination.idealDuration;

  const langElem = document.getElementById('infoLang');
  if (langElem) langElem.textContent = activeDestination.language;

  const currElem = document.getElementById('infoCurr');
  if (currElem) currElem.textContent = activeDestination.currency;

  // 4. Tab: Overview
  const overviewText = document.getElementById('tabOverviewText');
  if (overviewText) overviewText.textContent = activeDestination.overview;

  const highlightsContainer = document.getElementById('tabHighlightsGrid');
  if (highlightsContainer && activeDestination.highlights) {
    highlightsContainer.innerHTML = activeDestination.highlights.map(h => `
      <div class="highlight-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${h}</span>
      </div>
    `).join('');
  }

  // 5. Tab: Weather Widget
  renderWeatherWidget();

  // 6. Tab: Map
  const mapPinText = document.getElementById('mapPinText');
  if (mapPinText) mapPinText.textContent = `${activeDestination.name}, ${activeDestination.country}`;

  // 7. Tab: Hotels Section
  renderHotels();

  // 8. Tab: Packages Section
  renderPackages();

  // 9. Tab: Reviews
  renderReviews();

  // 10. Sticky Booking Sidebar Calculation
  updateSidebarCalculator();
}

function renderGalleryMosaic() {
  const galleryContainer = document.getElementById('galleryMosaicContainer');
  if (!galleryContainer || !activeDestination.gallery) return;

  galleryContainer.innerHTML = activeDestination.gallery.slice(0, 5).map((imgId, idx) => `
    <div class="mosaic-item" onclick="openLightbox('${uns(imgId, 1600, 85)}')">
      <img src="${uns(imgId, idx === 0 ? 900 : 500, 75)}" alt="${activeDestination.name} photo ${idx + 1}" loading="lazy">
      ${idx === 4 ? `
        <div class="mosaic-overlay-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          View All Photos
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderWeatherWidget() {
  const currentTemp = document.getElementById('weatherCurrentTemp');
  if (currentTemp) currentTemp.textContent = activeDestination.avgTemp;

  const forecastContainer = document.getElementById('weatherForecastBars');
  if (!forecastContainer || !activeDestination.weatherForecast) return;

  forecastContainer.innerHTML = activeDestination.weatherForecast.map(f => {
    const heightPercent = Math.min(Math.max((f.temp / 35) * 100, 30), 100);
    return `
      <div class="forecast-col">
        <div class="forecast-day">${f.day}</div>
        <div class="forecast-bar-track">
          <div class="forecast-bar-fill" style="height:${heightPercent}%;"></div>
        </div>
        <div class="forecast-temp">${f.temp}°</div>
      </div>
    `;
  }).join('');
}

function renderHotels() {
  const hotelsGrid = document.getElementById('hotelsGrid');
  if (!hotelsGrid || !activeDestination.hotels) return;

  hotelsGrid.innerHTML = activeDestination.hotels.map(h => `
    <div class="hotel-card">
      <div class="hotel-img">
        <img src="${uns(h.img, 500, 75)}" alt="${h.name}">
        <div class="hotel-stars">
          <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/></svg> ${h.stars}.0
        </div>
      </div>
      <div class="hotel-body">
        <h4>${h.name}</h4>
        <div class="hotel-amenities">
          ${h.amenities.map(a => `<span>✓ ${a}</span>`).join('')}
        </div>
        <div class="hotel-foot">
          <div class="hotel-price">From <b>$${h.price}</b> / night</div>
          <button class="btn btn-outline btn-sm" onclick="showToast('Selected ${h.name} for your stay!')">Select Hotel</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPackages() {
  const pkgGrid = document.getElementById('packagesGrid');
  if (!pkgGrid || !activeDestination.packages) return;

  pkgGrid.innerHTML = activeDestination.packages.map(p => `
    <div class="pkg-card" style="margin-bottom:20px;">
      <div class="pkg-media"><img src="${uns(activeDestination.img, 500, 75)}" alt="${p.title}"><span class="pkg-days">${p.duration}</span></div>
      <div class="pkg-body">
        <h3>${p.title}</h3>
        <p class="pkg-desc">All-inclusive itinerary curated specially for ${activeDestination.name}. Includes 5-star lodging, private transfers, and excursions.</p>
        <div class="pkg-meta">
          ${p.inclusions.map(inc => `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${inc}</span>`).join('')}
        </div>
        <div class="pkg-foot">
          <div class="pkg-price">Package Total <b>$${p.price.toLocaleString()}</b></div>
          <button class="btn btn-primary btn-sm" onclick="openBookingFor('${p.title}','${p.duration}',${p.price})">Book Package</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderReviews() {
  const reviewsContainer = document.getElementById('reviewsContainer');
  if (!reviewsContainer || !activeDestination.reviews) return;

  reviewsContainer.innerHTML = activeDestination.reviews.map(r => `
    <div class="testi-card" style="text-align:left;padding:24px;margin-bottom:16px;">
      <div class="testi-person" style="justify-content:flex-start;margin-bottom:12px;">
        <img src="${r.avatar}" alt="${r.name}">
        <div>
          <div class="name">${r.name}</div>
          <div class="loc">${r.date} · Verified Traveler</div>
        </div>
      </div>
      <p class="testi-text" style="font-size:15px;margin-bottom:12px;">"${r.text}"</p>
      <div class="testi-stars">${starsHTML(r.rating)}</div>
    </div>
  `).join('');
}

function starsHTML(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;color:var(--gold);"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6z"/></svg>`;
  }
  return s;
}

function switchTab(tabId) {
  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });
}

function updateSidebarCalculator() {
  if (!activeDestination) return;

  const guestSelect = document.getElementById('sideGuestsSelect');
  if (guestSelect) bookingCalculatorState.guests = Number(guestSelect.value);

  const tierSelect = document.getElementById('sideTierSelect');
  if (tierSelect) bookingCalculatorState.tierMultiplier = parseFloat(tierSelect.value);

  const basePricePerPerson = activeDestination.price * bookingCalculatorState.tierMultiplier;
  const subtotal = Math.round(basePricePerPerson * bookingCalculatorState.guests);
  const taxes = 142;
  const total = subtotal + taxes;

  const sideBasePrice = document.getElementById('sideBasePrice');
  if (sideBasePrice) sideBasePrice.textContent = `$${Math.round(basePricePerPerson).toLocaleString()}`;

  const calcSubtotal = document.getElementById('calcSubtotal');
  if (calcSubtotal) calcSubtotal.textContent = `$${subtotal.toLocaleString()}`;

  const calcTotal = document.getElementById('calcTotal');
  if (calcTotal) calcTotal.textContent = `$${total.toLocaleString()}`;
}

function triggerSidebarBooking() {
  if (!activeDestination) return;
  const guests = bookingCalculatorState.guests;
  const tierSelect = document.getElementById('sideTierSelect');
  const tierText = tierSelect ? tierSelect.options[tierSelect.selectedIndex].text : 'Luxury Package';
  
  const packageTitle = `${activeDestination.name} — ${tierText}`;
  const price = Math.round(activeDestination.price * bookingCalculatorState.tierMultiplier * guests);
  
  openBookingFor(packageTitle, activeDestination.idealDuration, price);
}

document.addEventListener('DOMContentLoaded', () => {
  loadDestinationDetails();

  // Tab switcher listeners
  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Sidebar calculation listeners
  const guestSelect = document.getElementById('sideGuestsSelect');
  if (guestSelect) guestSelect.addEventListener('change', updateSidebarCalculator);

  const tierSelect = document.getElementById('sideTierSelect');
  if (tierSelect) tierSelect.addEventListener('change', updateSidebarCalculator);
});
