// ========================================
// SOKRATES LANDING PAGE - Clean Version
// ========================================

// DOM Elements
const elements = {
  universeObj: document.querySelector('object[data*="universe.svg"]'),
  hint: document.getElementById('sokrates-hint'),
  input: document.getElementById('sokrates-input'),
  sendBtn: document.getElementById('sokrates-send'),
  response: document.getElementById('ai-response-text'),
  waves: document.getElementById('wave-visualizer')
};

// ========================================
// 1. SVG UNIVERSE HINTS
// ========================================

const games = {
  'longevity': {
    title: 'Hra: Stoletý desetibojař',
    text: 'Sokrates: Máte 70% šanci na aktivní pohyb v 85 letech.'
  },
  'strategy': {
    title: 'Hra o modrý oceán',
    text: 'Sokrates: Váš byznys model je z 85 % validní.'
  },
  'toc': {
    title: 'Hra o průtok',
    text: 'Sokrates: Průtok byznysu klesl na 82 %. Úzké místo v expedici.'
  }
};

function initUniverseHints() {
  if (!elements.universeObj || !elements.hint) {
    console.warn('⚠️ Universe SVG or hint element not found');
    return;
  }

  elements.universeObj.addEventListener('load', () => {
    const svgDoc = elements.universeObj.contentDocument;

    if (!svgDoc) {
      console.error('❌ Cannot access SVG document');
      return;
    }

    Object.keys(games).forEach(id => {
      const group = svgDoc.getElementById(id);

      if (!group) {
        console.warn(`⚠️ SVG group "${id}" not found`);
        return;
      }

      group.style.cursor = 'pointer';

      group.addEventListener('mouseenter', () => {
        elements.hint.innerHTML = `
          <strong style="color:#60a5fa; display:block; margin-bottom:4px;">
            ${games[id].title}
          </strong>
          ${games[id].text}
        `;
        elements.hint.style.opacity = '1';
      });

      group.addEventListener('mousemove', (e) => {
        const rect = elements.universeObj.getBoundingClientRect();
        elements.hint.style.left = (rect.left + e.clientX + 20) + 'px';
        elements.hint.style.top = (rect.top + e.clientY + 20) + 'px';
      });

      group.addEventListener('mouseleave', () => {
        elements.hint.style.opacity = '0';
      });
    });

    console.log('✅ Universe hints initialized');
  });

  elements.universeObj.addEventListener('error', () => {
    console.error('❌ Failed to load universe.svg');
  });
}

// ========================================
// 2. SOKRATES CHAT
// ========================================

const lokalniVedomi = {
  "hra": "Hra je pro nás simulace reality. Například ve Hře o průtok naši klienti často zjistí, že 80 % jejich úsilí jde do míst, která nebrzdí výsledek.",
  "kdo": "Sokrates je interpret vašeho digitálního vesmíru. Propojujeme biometrická data s vaším konáním.",
  "průtok": "Průtok (TOC) je srdcem naší metodiky. Identifikujeme úzká místa, která brzdí váš růst.",
  "default": "Tento vhled zatím ve tvém vesmíru nevidím, ale můžeme ho začít měřit."
};

async function askSokrates() {
  if (!elements.input || !elements.response) {
    console.error('❌ Chat elements not found');
    return;
  }

  const question = elements.input.value.trim();

  if (!question) return;

  // Reset input
  elements.input.value = "";

  // Show thinking state
  if (elements.waves) {
    elements.waves.classList.remove('idle');
    elements.waves.classList.add('thinking');
  }

  elements.response.style.opacity = "0.5";
  elements.response.innerText = "Sokrates interpretuje...";

  try {
    // Pokus o API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    elements.response.innerText = `"${data.answer}"`;
    console.log('✅ API response received');

  } catch (error) {
    console.warn('⚠️ API unavailable, using fallback:', error.message);

    // Fallback na lokální odpovědi
    const key = Object.keys(lokalniVedomi).find(k =>
      question.toLowerCase().includes(k)
    ) || "default";

    setTimeout(() => {
      elements.response.innerText = `"${lokalniVedomi[key]}"`;
    }, 600);
  } finally {
    setTimeout(() => {
      if (elements.waves) {
        elements.waves.classList.remove('thinking');
        elements.waves.classList.add('idle');
      }
      elements.response.style.opacity = "1";
    }, 800);
  }
}

function initSokratesChat() {
  if (!elements.sendBtn || !elements.input) {
    console.warn('⚠️ Chat elements not found');
    return;
  }

  // Click handler
  elements.sendBtn.addEventListener('click', askSokrates);

  // Enter key handler
  elements.input.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      askSokrates();
    }
  });

  console.log('✅ Sokrates chat initialized');
}

// ========================================
// 3. INITIALIZATION
// ========================================

function initLanding() {
  console.log('🚀 Initializing landing page...');

  try {
    initUniverseHints();
    initSokratesChat();
    console.log('✅ Landing page ready');
  } catch (error) {
    console.error('❌ Landing initialization failed:', error);
  }
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanding);
} else {
  initLanding();
}