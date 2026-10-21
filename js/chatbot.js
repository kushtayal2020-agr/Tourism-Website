/* ============================================================
   AZURA — AI Travel Assistant Chatbot
   Powered by Google Gemini API
   ============================================================
   HOW TO SET UP:
   1. Get a free Gemini API key from https://aistudio.google.com/app/apikey
   2. Replace the empty string below with your key
   ============================================================ */

const GEMINI_API_KEY = ''; // ← Paste your Gemini API key here

const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are ARIA (AZURA Real-time Intelligent Assistant), a luxury travel assistant for AZURA — a premium global tourism platform. 

Your role is to help travelers with:
- Destination recommendations and travel tips
- Package details, pricing, and itineraries
- Booking assistance and travel planning
- Visa, passport, and travel requirement guidance
- Local culture, food, weather, and best times to visit
- Hotel, flight, and experience suggestions

Personality: Warm, knowledgeable, elegant, and enthusiastic about travel. Speak with a touch of wanderlust. Keep responses concise but rich — use bullet points or short paragraphs. Suggest AZURA's services naturally when relevant.

AZURA offers packages to 120+ countries including Maldives, Bali, Swiss Alps, Santorini, Kyoto, Machu Picchu, Safari Kenya, Iceland, Dubai, and Amalfi Coast. Packages start from $1,200.

Always end with a helpful follow-up question or call to action.`;

/* ============================================================
   STATE
   ============================================================ */
let chatHistory = [];
let isStreaming  = false;
let chatOpen     = false;

/* ============================================================
   DOM INJECTION
   ============================================================ */
function injectChatbot() {
  const html = `
  <!-- ===== CHATBOT FLOATING BUTTON ===== -->
  <button id="chatbot-toggle" onclick="toggleChat()" aria-label="Open ARIA AI Assistant" title="Chat with ARIA">
    <span class="chat-icon-open">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 10h8M8 14h5" stroke-width="1.6"/>
      </svg>
    </span>
    <span class="chat-icon-close" style="display:none">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </span>
    <span class="chat-badge" id="chat-badge">1</span>
  </button>

  <!-- ===== CHATBOT PANEL ===== -->
  <div id="chatbot-panel" class="chatbot-panel" aria-label="ARIA Chat Panel">
    <!-- Header -->
    <div class="chatbot-header">
      <div class="chatbot-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
        <span class="avatar-pulse"></span>
      </div>
      <div class="chatbot-header-info">
        <span class="chatbot-name">ARIA</span>
        <span class="chatbot-status" id="chatbot-status">
          <span class="status-dot"></span>AI Travel Assistant
        </span>
      </div>
      <div class="chatbot-header-actions">
        <button class="chat-action-btn" onclick="clearChat()" title="Clear chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
        <button class="chat-action-btn" onclick="toggleChat()" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="chatbot-messages" id="chatbot-messages">
      <div class="chat-welcome">
        <div class="welcome-globe">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>
          </svg>
        </div>
        <h4>Hi! I'm ARIA ✈️</h4>
        <p>Your personal AI travel assistant. Ask me anything about destinations, packages, visas, or travel tips!</p>
      </div>

      <!-- Quick suggestions -->
      <div class="chat-suggestions" id="chat-suggestions">
        <button onclick="sendSuggestion('What are the best beach destinations?')">🏖️ Best beach destinations</button>
        <button onclick="sendSuggestion('Show me luxury packages under $3000')">💎 Luxury packages</button>
        <button onclick="sendSuggestion('I need visa information for Bali')">🛂 Visa information</button>
        <button onclick="sendSuggestion('Best time to visit Japan?')">🗾 Visit Japan</button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chatbot-input-area">
      <div class="chatbot-input-wrap">
        <textarea
          id="chatbot-input"
          placeholder="Ask ARIA anything about travel…"
          rows="1"
          onkeydown="handleChatKey(event)"
          oninput="autoResize(this)"
          aria-label="Chat message input"
        ></textarea>
        <button id="chatbot-send" onclick="sendMessage()" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div class="chatbot-footer-note">Powered by Gemini AI · AZURA Travel</div>
    </div>
  </div>`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // Show welcome badge after delay
  setTimeout(() => {
    const badge = document.getElementById('chat-badge');
    if (badge && !chatOpen) badge.classList.add('visible');
  }, 3000);
}

/* ============================================================
   TOGGLE CHAT
   ============================================================ */
function toggleChat() {
  chatOpen = !chatOpen;
  const panel  = document.getElementById('chatbot-panel');
  const toggle = document.getElementById('chatbot-toggle');
  const openIcon  = toggle.querySelector('.chat-icon-open');
  const closeIcon = toggle.querySelector('.chat-icon-close');
  const badge  = document.getElementById('chat-badge');

  if (chatOpen) {
    panel.classList.add('open');
    toggle.classList.add('active');
    openIcon.style.display  = 'none';
    closeIcon.style.display = 'flex';
    if (badge) badge.classList.remove('visible');
    setTimeout(() => {
      const input = document.getElementById('chatbot-input');
      if (input) input.focus();
    }, 350);
  } else {
    panel.classList.remove('open');
    toggle.classList.remove('active');
    openIcon.style.display  = 'flex';
    closeIcon.style.display = 'none';
  }
}

/* ============================================================
   SEND MESSAGE
   ============================================================ */
async function sendMessage() {
  if (isStreaming) return;
  const input = document.getElementById('chatbot-input');
  const text  = input.value.trim();
  if (!text) return;

  // Add user message
  appendMessage('user', text);
  chatHistory.push({ role: 'user', parts: [{ text }] });
  input.value = '';
  autoResize(input);

  // Hide suggestions after first message
  const sugg = document.getElementById('chat-suggestions');
  if (sugg) sugg.style.display = 'none';

  // Show typing indicator
  const typingId = showTyping();
  isStreaming = true;
  setSendState(true);

  // If Gemini API Key is configured, attempt real Gemini stream
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: chatHistory,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }

      // Remove typing indicator & create bot bubble
      removeTyping(typingId);
      const botBubbleId = createBotBubble();

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const token  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (token) {
              fullText += token;
              updateBotBubble(botBubbleId, fullText);
            }
          } catch (_) { }
        }
      }

      if (fullText) {
        chatHistory.push({ role: 'model', parts: [{ text: fullText }] });
      }
      return;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent ARIA knowledge engine:', err.message);
      // Fall through to offline engine
    }
  }

  // ── INTELLIGENT OFFLINE ARIA ENGINE (Simulated Streaming) ──
  setTimeout(async () => {
    removeTyping(typingId);
    const botBubbleId = createBotBubble();
    const offlineText = getAriaOfflineAnswer(text);

    let displayed = '';
    const words = offlineText.split(' ');
    for (let i = 0; i < words.length; i++) {
      displayed += (i > 0 ? ' ' : '') + words[i];
      updateBotBubble(botBubbleId, displayed);
      // Realistic typing cadence
      await new Promise(r => setTimeout(r, 22));
    }

    chatHistory.push({ role: 'model', parts: [{ text: offlineText }] });
    isStreaming = false;
    setSendState(false);
    scrollToBottom();
  }, 450);
}

/**
 * Intelligent ARIA knowledge engine covering destinations, packages, pricing, & tips
 */
function getAriaOfflineAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes('santorini') || q.includes('greece')) {
    return `**Santorini, Greece** is the crown jewel of the Aegean Sea! 🇬🇷\n\n• **Highlights**: White-washed cliffside villas in Oia, breathtaking caldera sunsets, and private volcanic catamaran cruises.\n• **Packages**: Starting from **$1,350** (4 Days) to **$1,890** (6 Days Romantic Getaway) including 5-star cave suites and wine tastings.\n• **Best Time**: May through October.\n\nWould you like me to guide you to the booking page for Santorini?`;
  }

  if (q.includes('bali') || q.includes('indonesia')) {
    return `**Bali, Indonesia** is our most popular tropical paradise! 🌴\n\n• **Highlights**: Terraced emerald rice paddies in Ubud, private cliffside villas in Uluwatu, and sunrise hikes up Mount Batur.\n• **Packages**: Starting from **$890** (5 Days) to **$1,420** (7 Days Honeymoon & Spa Retreat).\n• **Best Time**: April to October for sunny tropical weather.\n\nShould we look into Ubud jungle resorts or Uluwatu beach retreats for you?`;
  }

  if (q.includes('kyoto') || q.includes('japan')) {
    return `**Kyoto, Japan** is an enchanting cultural haven! ⛩️\n\n• **Highlights**: Arashiyama Bamboo Grove, Fushimi Inari Torii gates, authentic matcha tea ceremonies, and traditional ryokans.\n• **Packages**: Starting from **$1,050** to **$2,350** for the Japan Golden Route.\n• **Best Time**: March–May (Cherry Blossoms) and October–November (Autumn Foliage).\n\nAre you interested in our cultural culinary tours in Kyoto?`;
  }

  if (q.includes('swiss') || q.includes('alps') || q.includes('switzerland')) {
    return `**Swiss Alps, Switzerland** offers the pinnacle of alpine wonder! 🏔️\n\n• **Highlights**: Scenic Glacier Express rides, Matterhorn skiing in Zermatt, and luxury chalets.\n• **Packages**: Starting from **$1,480** to **$2,450** with panoramic first-class rail passes.\n• **Best Time**: December–April for skiing, and June–September for wildflower hiking.\n\nWould you prefer a winter ski adventure or summer hiking?`;
  }

  if (q.includes('maldives')) {
    return `**The Maldives** is pure overwater bliss! 🏝️\n\n• **Highlights**: Private overwater villas with water slides, vibrant coral reefs with manta rays, and underwater dining.\n• **Packages**: Starting from **$2,150** to **$3,200** with private seaplane transfers and all-inclusive dining.\n• **Best Time**: November to April for glassy calm turquoise seas.\n\nWould you like to explore our private lagoon suites?`;
  }

  if (q.includes('gwalior') || q.includes('fort')) {
    return `**Gwalior, India** is a treasure trove of royal heritage! 🏰\n\n• **Highlights**: The majestic 8th-century Gwalior Fort ('Pearl in the necklace of forts of Hind'), Jai Vilas Palace museum with its legendary crystal chandeliers, and Tansen's Tomb.\n• **Packages**: Starting from **₹7,999** ($95) for a 3-Day royal heritage tour.\n• **Best Time**: October through March for pleasant sightseeing weather.\n\nWould you like recommendations for heritage hotels in Gwalior?`;
  }

  if (q.includes('package') || q.includes('cost') || q.includes('price') || q.includes('deal')) {
    return `AZURA curates over **104 verified tour packages** across 120+ destinations! ✈️\n\n• **Budget & Culture**: Starting from **$890** (Bali, Kyoto, Peru)\n• **Luxury & Romance**: **$1,400 – $2,500** (Santorini, Amalfi Coast, Swiss Alps)\n• **Ultra-Exclusive**: **$3,000+** (Maldives Overwater Villas, Serengeti Luxury Safari)\n\nAll packages include handpicked 5-star accommodations, daily breakfasts, VIP airport transfers, and verified local guides. What is your preferred budget range?`;
  }

  if (q.includes('book') || q.includes('reserve') || q.includes('pay') || q.includes('method')) {
    return `Booking with AZURA is 100% secure and effortless! 💳\n\n1. **Select Package**: Choose your destination and travel dates.\n2. **Customise Travelers**: Add travelers and special requests.\n3. **Instant Confirmation**: Pay securely via Visa, MasterCard, UPI, PayPal, or Apple Pay.\n\nAll bookings come with our **AZURA Flexible Cancellation Promise** (full refund up to 72 hours before departure). Would you like to proceed with a booking now?`;
  }

  if (q.includes('best time') || q.includes('when to visit') || q.includes('weather')) {
    return `Here are the ideal travel windows for AZURA's top picks! ☀️\n\n• **Mediterranean (Santorini, Amalfi)**: May to October\n• **Southeast Asia (Bali, Thailand)**: April to October\n• **East Asia (Kyoto, Japan)**: Spring (Mar–May) & Autumn (Oct–Nov)\n• **Alpine (Swiss Alps)**: Dec–Mar (Snow) & Jun–Sep (Alpine lakes)\n• **Tropical Islands (Maldives)**: November to April\n\nTell me where you want to go and I'll share current seasonal details!`;
  }

  // Friendly conversational default
  return `Hello there! I'm **ARIA**, your personal AZURA Travel Assistant. ✈️✨\n\nI can assist you with:\n• **Top Destinations**: Santorini, Bali, Swiss Alps, Kyoto, Maldives, Dubai, Gwalior & more\n• **Curated Packages**: Romantic getaways, family tours, and adventure itineraries\n• **Booking & Payments**: Instant quotes, multi-traveler bookings, and flexible cancellations\n\nWhere in the world are you dreaming of traveling next?`;
}

function sendSuggestion(text) {
  const input = document.getElementById('chatbot-input');
  input.value = text;
  sendMessage();
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

/* ============================================================
   UI HELPERS
   ============================================================ */
function appendMessage(role, text) {
  const container = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;

  if (role === 'bot') {
    div.innerHTML = `
      <div class="chat-msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>
      <div class="chat-msg-bubble">${renderMarkdown(text)}</div>`;
  } else {
    div.innerHTML = `<div class="chat-msg-bubble">${escapeHtml(text)}</div>`;
  }

  container.appendChild(div);
  scrollToBottom();
  return div.id;
}

function createBotBubble() {
  const id = 'bot-bubble-' + Date.now();
  const container = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-bot';
  div.id = id;
  div.innerHTML = `
    <div class="chat-msg-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </div>
    <div class="chat-msg-bubble" id="${id}-content"><span class="cursor-blink">▋</span></div>`;
  container.appendChild(div);
  scrollToBottom();
  return id;
}

function updateBotBubble(id, text) {
  const el = document.getElementById(`${id}-content`);
  if (el) {
    el.innerHTML = renderMarkdown(text) + '<span class="cursor-blink">▋</span>';
    scrollToBottom();
  }
}

function showTyping() {
  const id = 'typing-' + Date.now();
  const container = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-bot';
  div.id = id;
  div.innerHTML = `
    <div class="chat-msg-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </div>
    <div class="chat-msg-bubble typing-indicator"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function setSendState(loading) {
  const btn = document.getElementById('chatbot-send');
  if (!btn) return;
  btn.classList.toggle('loading', loading);
}

function scrollToBottom() {
  const container = document.getElementById('chatbot-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

function clearChat() {
  chatHistory = [];
  const container = document.getElementById('chatbot-messages');
  if (!container) return;
  container.innerHTML = `
    <div class="chat-welcome">
      <div class="welcome-globe">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>
        </svg>
      </div>
      <h4>Hi! I'm ARIA ✈️</h4>
      <p>Your personal AI travel assistant. Ask me anything about destinations, packages, visas, or travel tips!</p>
    </div>
    <div class="chat-suggestions" id="chat-suggestions">
      <button onclick="sendSuggestion('What are the best beach destinations?')">🏖️ Best beach destinations</button>
      <button onclick="sendSuggestion('Show me luxury packages under $3000')">💎 Luxury packages</button>
      <button onclick="sendSuggestion('I need visa information for Bali')">🛂 Visa information</button>
      <button onclick="sendSuggestion('Best time to visit Japan?')">🗾 Visit Japan</button>
    </div>`;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* ============================================================
   MARKDOWN RENDERER (lightweight)
   ============================================================ */
function renderMarkdown(text) {
  return text
    // Escape HTML first
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code `text`
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links [label](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered list lines starting with - or •
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Numbered list
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Line breaks → <br>
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', injectChatbot);
