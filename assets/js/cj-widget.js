// =====================================================
// 🧠 Chytré já – Floating Widget (BACKEND VERSION v2025-03-10)
// =====================================================

console.log("🔥 CJ-WIDGET VERSION: 2025-03-10 (BACKEND) LOADED");

// test proměnná
window.cjTest = "CJ WIDGET IS ACTIVE";

// ====== DOM ELEMENTY ======
const widgetBtn = document.getElementById("cj-widget-btn");
const widgetPanel = document.getElementById("cj-widget-panel");
const closeBtn = document.getElementById("cj-close");
const sendBtn = document.getElementById("cj-send");
const input = document.getElementById("cj-input");
const messages = document.getElementById("cj-messages");

if (!widgetBtn || !widgetPanel || !closeBtn || !sendBtn || !input || !messages) {
  console.error("❌ CJ: DOM prvky chybí");
} else {

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

  // ====== BACKEND VOLÁNÍ ======
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
      console.error("CJ API ERROR:", e);
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
    const reply = await askAI(text);
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
    widgetBtn.classList.add("hide");
  });

  closeBtn.addEventListener("click", () => {
    widgetPanel.classList.remove("open");
    setTimeout(() => widgetBtn.classList.remove("hide"), 300);
  });

  console.log("✅ Chytré já připraveno (BACKEND MODE)");
}
