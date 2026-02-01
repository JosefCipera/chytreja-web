// ========================================
// LANDING PAGE — čistá verze
// ========================================

// ========================================
// 1. UNIVERSE HINTS (hover na SVG)
// ========================================

const universeHints = {
  obj: document.querySelector('object[data*="universe.svg"]'),
  hint: document.getElementById('sokrates-hint')
};

const games = {
  'longevity': {
    title: 'Vesmír: Stoletý desetibojař',
    text: 'Chytré já: Máte 70% šanci na aktivní pohyb v 85 letech.'
  },
  'strategy': {
    title: 'Vesmír: Byznys modely',
    text: 'Chytré já: Váš byznys model je z 87 % validní.'
  },
  'toc': {
    title: 'Vesmír: Teorie omezení (TOC)',
    text: 'Chytré já: Průtok byznysu klesl na 11 %. Úzké místo je v expedici.'
  }
};

function initUniverseHints() {
  if (!universeHints.obj) return;

  universeHints.obj.addEventListener('load', () => {
    const svgDoc = universeHints.obj.contentDocument;
    if (!svgDoc) return;

    Object.keys(games).forEach(id => {
      const group = svgDoc.getElementById(id);
      if (!group) return;

      group.style.cursor = 'pointer';

      group.addEventListener('mouseenter', () => {
        if (!universeHints.hint) return;
        universeHints.hint.innerHTML = `
          <strong style="color:#60a5fa; display:block; margin-bottom:4px;">${games[id].title}</strong>
          ${games[id].text}
        `;
        universeHints.hint.style.opacity = '1';
      });

      group.addEventListener('mousemove', (e) => {
        if (!universeHints.hint) return;
        const rect = universeHints.obj.getBoundingClientRect();
        universeHints.hint.style.left = (rect.left + e.clientX + 20) + 'px';
        universeHints.hint.style.top = (rect.top + e.clientY + 20) + 'px';
      });

      group.addEventListener('mouseleave', () => {
        if (universeHints.hint) universeHints.hint.style.opacity = '0';
      });
    });
  });
}

// ========================================
// 2. BATERIE ANIMACE
// ========================================

function animateBattery(targetValue) {
  const fill = document.getElementById('js-battery-fill');
  const counter = document.querySelector('.battery-val');
  if (!fill || !counter) return;

  // Reset + animate fill
  fill.style.width = '0%';
  setTimeout(() => {
    fill.style.width = targetValue + '%';
    fill.style.filter = 'brightness(1.3)';
    setTimeout(() => { fill.style.filter = 'none'; }, 700);
  }, 200);

  // Animate counter (tachometr)
  let current = 0;
  const duration = 2000;
  const fps = 60;
  const frameTime = 1000 / fps;
  const totalFrames = Math.round(duration / frameTime);
  const increment = targetValue / totalFrames;

  const interval = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      counter.innerHTML = `${targetValue}<span>%</span>`;
      clearInterval(interval);
    } else {
      counter.innerHTML = `${Math.floor(current)}<span>%</span>`;
    }
  }, frameTime);
}

// ========================================
// 3. CHIP INTERACTIONS
// ========================================

let hideTimeout = null;

function showResult(text, autoHide = true) {
  const resultDiv = document.getElementById('interactive-result');
  if (!resultDiv) return;

  if (hideTimeout) clearTimeout(hideTimeout);

  resultDiv.innerHTML = text.replace(/\n/g, '<br>');
  resultDiv.classList.add('visible');

  setTimeout(() => {
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  if (autoHide) {
    hideTimeout = setTimeout(() => {
      resultDiv.classList.remove('visible');
    }, 10000);
  }
}

function initChipInteractions() {
  const chips = document.querySelectorAll('.chip');
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const action = chip.dataset.action;

      // Visual feedback
      chip.style.transform = 'scale(0.95)';
      setTimeout(() => { chip.style.transform = ''; }, 150);

      showResult('⏳ Načítám informace...', false);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: chip.textContent.trim() })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const answer = data.answer || data.response || 'Momentálně nedostupné.';
        showResult(`💬 ${answer}`);

      } catch (error) {
        const fallback = fallbacks[action] || '💬 Zajímavá otázka! Pro plnou odpověď se přihlaste do aplikace.';
        showResult(fallback);
      }
    });
  });
}

// ========================================
// 4. WAVEFORM (VLNKY) — hlasové zadání
// ========================================

function initWaveformInteraction() {
  const waveformBox = document.querySelector('.waveform-box');
  if (!waveformBox) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    waveformBox.addEventListener('click', () => {
      showResult('🎤 Hlasové ovládání není podporováno ve vašem prohlížeči.');
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'cs-CZ';
  recognition.continuous = false;
  recognition.interimResults = false;

  waveformBox.addEventListener('click', () => {
    try {
      recognition.start();
      waveformBox.classList.add('active');
      showResult('🎤 Poslouchám...', false);
    } catch (error) {
      showResult('❌ Nepodařilo se spustit rozpoznávání řeči.');
    }
  });

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    showResult(`🎤 Slyšel jsem: "${transcript}"<br><br>⏳ Načítám odpověď...`, false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: transcript })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const answer = data.answer || data.response || 'Momentálně nedostupné.';
      showResult(`🎤 "${transcript}"<br><br>💬 ${answer}`);

    } catch (error) {
      showResult(`🎤 "${transcript}"<br><br>💬 Pro plnou odpověď se přihlaste do aplikace!`);
    }
  };

  recognition.onend = () => {
    waveformBox.classList.remove('active');
  };

  recognition.onerror = (event) => {
    waveformBox.classList.remove('active');
    if (event.error === 'no-speech') {
      showResult('🔇 Nebylo zachyceno žádné slovo. Zkuste to znovu.');
    } else {
      showResult('❌ Chyba rozpoznávání řeči. Zkuste to znovu.');
    }
  };
}

// ========================================
// 5. HAMBURGER MENU
// ========================================

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
}

// ========================================
// 6. PRICING TOGGLE
// ========================================

function initPricingToggle() {
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pricing-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.dataset.target;
      document.getElementById(`pricing-${target}`).classList.add('active');
    });
  });
}

// ========================================
// 7. GAME CARD CLICK → baterie animace
// ========================================

function initGameCardClick() {
  const gameCard = document.querySelector('.game-card');
  if (!gameCard) return;

  gameCard.addEventListener('click', () => {
    animateBattery(85);
  });
}

// ========================================
// INIT — vše spuštění po DOMContentLoaded
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initUniverseHints();
  initHamburger();
  initPricingToggle();
  initChipInteractions();
  initWaveformInteraction();
  initGameCardClick();
  animateBattery(85);
});
const questions = [
  "Jak si vedu v pohybové stabilitě?",
  "Co se stane, když zvýším VO2 Max o 10 %?",
  "Mám dostatek bílkovin pro svůj desetiboj?",
  "Jaká je moje předpověď aktivního života?",
  "Jak moje konzistence ovlivňuje baterii?"
];

let questionIndex = 0;
let charIndex = 0;
let isInteracted = false; // Pojistka proti přemazání odpovědi rotací

function typeWriter() {
  if (isInteracted) return; // Pokud uživatel klikl, rotace končí

  const textElem = document.getElementById('rotating-text');
  if (!textElem) return;

  const currentQuestion = questions[questionIndex];

  // Psaní textu
  textElem.innerText = currentQuestion.substring(0, charIndex + 1);
  charIndex++;

  if (charIndex < currentQuestion.length) {
    // Pokračujeme v psaní dalšího znaku
    setTimeout(typeWriter, 60);
  } else {
    // Věta je dopsaná, počkáme a pak skočíme na další
    setTimeout(() => {
      if (isInteracted) return;
      charIndex = 0;
      questionIndex = (questionIndex + 1) % questions.length;
      typeWriter();
    }, 3000); // Tady to 3 sekundy "stojí" dopsané
  }
}

// Úprava tvé interakční funkce, aby zastavila psaní
function handleCHJInteraction(action) {
  isInteracted = true; // Zastaví cyklus typeWriter

  const resultDiv = document.getElementById('rotating-text'); // Píšeme přímo do bubliny
  const answer = fallbacks[action] || fallbacks['voice'];

  if (resultDiv) {
    resultDiv.innerText = answer;
    // Odstraníme kurzor po interakci (volitelné)
    resultDiv.style.borderRight = "none";
  }
}

document.addEventListener('DOMContentLoaded', typeWriter);

// Upravené odpovědi (Fallbacks)
const fallbacks = {
  zdravi: '⚖️ Tvoje Stabilita drží baterii na 85 %. Pokud ji udržíš, přidáváš si 5 let aktivního desetiboje bez omezení.',
  telo: '💪 VO2 Max je motor tvých 85 %. Aktuálně jsi nad plánem, což ti dává obrovskou rezervu pro dlouhověkost.',
  vyziva: '🥩 Pozor, tvoje svalová rezerva (bílkoviny) je pod limitem! Tvá baterie 85 % začne bez nápravy rychle klesat.',
  mysl: '🧠 Mysl a konzistence jsou klíčem. Díky nim tvá baterie zůstane v zelených číslech i za 10 let.',
  voice: '💬 Zajímavá otázka! Pro analýzu tvého hlasu se prosím přihlas do aplikace.'
};

function handleCHJInteraction(action) {
  // Zastavíme rotaci, jakmile uživatel projeví zájem
  clearInterval(rotationInterval);

  const resultDiv = document.getElementById('interactive-result');
  const bubbleBox = document.getElementById('ai-bubble-box'); // Můžeme psát i do bubliny

  const text = fallbacks[action] || fallbacks['voice'];

  // Zobrazení v interaktivním výsledku
  if (resultDiv) {
    resultDiv.innerText = text;
    resultDiv.style.opacity = '1';
    resultDiv.style.transform = 'translateY(0)';
  }
}