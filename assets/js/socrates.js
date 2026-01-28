// js/sokrates.js

const Sokrates = {
  // 1. Mapování prvků (vše na jednom místě)
  input: document.getElementById('sokrates-input'),
  sendBtn: document.getElementById('sokrates-send'),
  visualizer: document.getElementById('wave-visualizer'),
  responseText: document.getElementById('ai-response-text'),

  init() {
    if (!this.input || !this.sendBtn) return;
    this.events();
    console.log("Σ Sokrates online.");
  },

  events() {
    // Kliknutí na šipku v kolečku
    this.sendBtn.addEventListener('click', () => this.interpret());

    // Enter v řádku
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.interpret();
    });
  },

  async interpret() {
    const query = this.input.value.trim();
    if (!query) return;

    // Vizualizace: Začátek uvažování
    this.input.value = "";
    this.visualizer.className = 'sokrates-waves thinking';
    this.responseText.style.opacity = "0.4";
    this.responseText.innerText = "Interpretuji souvislosti...";

    try {
      // Volání tvého backendu (chat.js)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query })
      });

      const data = await res.json();

      // Výsledek
      this.visualizer.className = 'sokrates-waves idle';
      this.responseText.style.opacity = "1";
      this.responseText.innerText = `"${data.answer || "Vesmír mlčí."}"`;

    } catch (err) {
      this.visualizer.className = 'sokrates-waves idle';
      this.responseText.innerText = "Spojení s vědomím přerušeno.";
      console.error("Sokrates Error:", err);
    }
  }
};

// Spuštění
document.addEventListener('DOMContentLoaded', () => Sokrates.init());