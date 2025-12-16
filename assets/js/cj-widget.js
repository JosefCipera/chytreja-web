// =====================================================
// 🧠 Chytré já – Floating Widget (FULL CLEAN VERSION v2025-03-10)
// =====================================================

console.log("🔥 CJ-WIDGET VERSION: 2025-03-10 LOADED");

// test proměnná
window.cjTest = "CJ WIDGET IS ACTIVE";

// ====== API KEY LOAD ======
let API_KEY = "";

(async () => {
  console.log("🔧 Inicializace Chytrého já…");

  // 1) PRODUKCE – key v HTML
  if (window.CHYTREJA_API_KEY) {
    API_KEY = window.CHYTREJA_API_KEY;
    console.log("🔑 API key: production");
  }

  // 2) LOKÁL – env.js
  if (!API_KEY) {
    try {
      const env = await import("./env.js");
      API_KEY = env.OPENAI_API_KEY || "";
      console.log("🔑 API key: env.js loaded");
    } catch (e) {
      console.warn("⚠️ env.js nenalezen – API offline.");
    }
  }

  // 3) pokud stále není API:
  if (!API_KEY) {
    console.error("❌ API KEY NENÍ NAČTEN – odpovědi nebudou fungovat.");
  }

  // ====== DOM ELEMENTY ======
  const widgetBtn = document.getElementById("cj-widget-btn");
  const widgetPanel = document.getElementById("cj-widget-panel");
  const closeBtn = document.getElementById("cj-close");
  const sendBtn = document.getElementById("cj-send");
  const input = document.getElementById("cj-input");
  const messages = document.getElementById("cj-messages");

  if (!widgetBtn || !widgetPanel || !closeBtn || !sendBtn || !input || !messages) {
    console.error("❌ CJ: DOM prvky chybí");
    return;
  }

  // ====== FUNKCE ======

  function addMessage(text, who = "ai") {
    const div = document.createElement("div");
    div.className = "cj-msg " + who;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addThinking() {
    const div = document.createElement("div");
    div.className = "cj-msg ai-thinking";
    div.textContent = "…";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // ====== OPENAI VOLÁNÍ – UPRAVENÁ VERZE ======
  async function askAI(question) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      return data.answer || "Zatím neumím odpovědět.";
    } catch (e) {
      return "Chyba při komunikaci se serverem.";
    }
  }

  // ====== ODESLÁNÍ ZPRÁVY ======

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const thinking = addThinking();
    const reply = await askOpenAI(text);
    thinking.remove();

    addMessage(reply, "ai");
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // ====== OTEVŘENÍ & ZAVŘENÍ ======

  widgetBtn.addEventListener("click", () => {
    widgetPanel.classList.add("open");
    widgetBtn.classList.add("hide");   // bublina zmizí
  });

  closeBtn.addEventListener("click", () => {
    widgetPanel.classList.remove("open");
    setTimeout(() => widgetBtn.classList.remove("hide"), 300); // vrátí bublinu
  });

  console.log("✅ Chytré já připraveno (FULL CLEAN)");

})();
