document.addEventListener("DOMContentLoaded", () => {
  const leadTextEl = document.getElementById("lead-text");
  const channelEl = document.getElementById("lead-channel");
  const sendBtn = document.getElementById("send-btn");
  const statusEl = document.getElementById("status-message");

  const clientMessageEl = document.getElementById("client-message");
  const aiReplyEl = document.getElementById("ai-reply");

  const leadScoreEl = document.getElementById("lead-score");
  const leadPriorityEl = document.getElementById("lead-priority");
  const handlingModeEl = document.getElementById("handling-mode");

  const metricIntentEl = document.getElementById("metric-intent");
  const metricAreaEl = document.getElementById("metric-area");
  const metricBudgetEl = document.getElementById("metric-budget");
  const metricTimeframeEl = document.getElementById("metric-timeframe");
  const metricClientTypeEl = document.getElementById("metric-client-type");
  const metricLanguageEl = document.getElementById("metric-language");

  const personaNameEl = document.getElementById("persona-name");
  const personaSpecialtyEl = document.getElementById("persona-specialty");
  const personaAreasEl = document.getElementById("persona-areas");
  const personaDescriptionEl = document.getElementById("persona-description");

  const knowledgeListEl = document.getElementById("knowledge-list");

  // Preset buttons
  document
    .getElementById("btn-preset-rental")
    .addEventListener("click", () => {
      leadTextEl.value =
        "Hi, I’m looking for a 1BR rental in JVC. Budget around 75k. Planning to move in the next 2 months. Just exploring options for now.";
      channelEl.value = "whatsapp";
    });

  document
    .getElementById("btn-preset-investor")
    .addEventListener("click", () => {
      leadTextEl.value =
        "Hello, I’m interested in an off-plan investment in Dubai Creek Harbour with a budget around 1.8M AED. Mainly focused on ROI and payment plans over 3-5 years.";
      channelEl.value = "email";
    });

  document
    .getElementById("btn-preset-luxury")
    .addEventListener("click", () => {
      leadTextEl.value =
        "Hi, I’m looking for a villa on Palm Jumeirah around 10M AED, planning to buy within the next 1–2 months and ready to move quickly.";
      channelEl.value = "whatsapp";
    });

  sendBtn.addEventListener("click", async () => {
    const text = leadTextEl.value.trim();
    const channel = channelEl.value;

    if (!text) {
      statusEl.textContent = "Please paste or type a lead message first.";
      return;
    }

    try {
      sendBtn.disabled = true;
      statusEl.textContent = "Running KeySync analysis…";

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ channel, text })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      statusEl.textContent = "";

      updateUI(text, data);
    } catch (err) {
      console.error("Error calling /api/lead:", err);
      statusEl.textContent = `Error: ${err.message || "Failed to reach server"}`;
    } finally {
      sendBtn.disabled = false;
    }
  });

  function updateUI(originalText, data) {
    const { analysis, persona, knowledge, reply, handling_mode, needs_human } =
      data || {};

    // Conversation
    clientMessageEl.textContent = originalText;
    aiReplyEl.textContent =
      reply || "No reply generated. Check console for details.";

    // Lead score & routing
    leadScoreEl.textContent =
      analysis && analysis.lead_score != null ? analysis.lead_score : "–";

    setPriorityPill(leadPriorityEl, analysis && analysis.priority);
    setHandlingPill(handlingModeEl, handling_mode);

    // Metrics
    metricIntentEl.textContent = analysis?.intent || "–";
    metricAreaEl.textContent = analysis?.area || "–";
    metricBudgetEl.textContent =
      typeof analysis?.budget === "number" && analysis.budget > 0
        ? analysis.budget.toLocaleString("en-AE")
        : "–";
    metricTimeframeEl.textContent = analysis?.timeframe || "–";
    metricClientTypeEl.textContent = analysis?.client_type || "–";
    metricLanguageEl.textContent = analysis?.language || "–";

    // Persona
    if (persona) {
      personaNameEl.textContent = persona.name || "–";
      personaSpecialtyEl.textContent = persona.specialty || "–";
      personaAreasEl.textContent = (persona.areas || []).join(", ") || "–";
      personaDescriptionEl.textContent = persona.description || "–";
    } else {
      personaNameEl.textContent = "–";
      personaSpecialtyEl.textContent = "–";
      personaAreasEl.textContent = "–";
      personaDescriptionEl.textContent = "–";
    }

    // Qdrant snippets
    renderKnowledgeList(analysis && analysis.qdrant_context);
  }

  function setPriorityPill(el, priorityRaw) {
    const priority = (priorityRaw || "").toLowerCase();
    el.className = "pill"; // reset
    el.classList.add("pill");

    el.classList.add(
      priority === "high"
        ? "pill-high"
        : priority === "medium"
        ? "pill-medium"
        : priority === "low"
        ? "pill-low"
        : "pill-muted"
    );

    el.textContent = priority || "–";
  }

  function setHandlingPill(el, modeRaw) {
    const mode = (modeRaw || "").toLowerCase();
    el.className = "pill";
    el.classList.add("pill");

    if (mode === "ai") {
      el.classList.add("pill-ai");
      el.textContent = "AI handled";
    } else if (mode === "human") {
      el.classList.add("pill-human");
      el.textContent = "Escalated to human";
    } else {
      el.classList.add("pill-muted");
      el.textContent = "–";
    }
  }

  function renderKnowledgeList(snippets) {
    while (knowledgeListEl.firstChild) {
      knowledgeListEl.removeChild(knowledgeListEl.firstChild);
    }

    if (!snippets || !snippets.length) {
      const li = document.createElement("li");
      li.className = "knowledge-empty";
      li.textContent =
        "No Qdrant snippets used for this lead (either escalated to human or no strong matches).";
      knowledgeListEl.appendChild(li);
      return;
    }

    snippets.forEach((snip) => {
      const li = document.createElement("li");
      const payload = snip.payload || {};
      const metaParts = [];

      if (payload.type) metaParts.push(payload.type);
      if (payload.area) metaParts.push(payload.area);
      if (payload.topic) metaParts.push(payload.topic);
      if (payload.persona_id) metaParts.push(`persona: ${payload.persona_id}`);

      const meta =
        metaParts.length > 0 ? ` (${metaParts.join(" • ")})` : "";

      li.textContent = `${snip.text}${meta}`;
      knowledgeListEl.appendChild(li);
    });
  }
});
console.log("KeySync Lite script loaded");

const btn = document.getElementById("testBtn");
const output = document.getElementById("output");

if (!btn || !output) {
  console.error("Button or output element not found in DOM");
} else {
  btn.addEventListener("click", async () => {
    output.textContent = "Sending lead to backend...";
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          channel: "whatsapp",
          text:
            "Hi, I’m looking for a 1BR rental in JVC. Budget around 75k. Planning to move in the next 2 months. Just exploring options for now."
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      console.log("Received response from /api/lead:", data);
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      console.error("Error calling /api/lead:", err);
      output.textContent = "Error: " + err.message;
    }
  });
}

// ----- Simple view switching (Live Console / Inbox / AI Brain) -----
(function setupViewTabs() {
  const tabs = document.querySelectorAll(".view-tab");
  const views = {
    customer: document.getElementById("view-customer"),
    intelligence: document.getElementById("view-intelligence"),
  };

  if (!tabs.length) return;

  function showView(name) {
    Object.keys(views).forEach((key) => {
      if (!views[key]) return;
      views[key].classList.toggle("view-active", key === name);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("view-tab-active"));
      tab.classList.add("view-tab-active");
      showView(tab.dataset.view);
    });
  });

  showView("customer"); // start with Customer View
})();
