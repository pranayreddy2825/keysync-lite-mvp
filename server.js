const express = require("express");
const path = require("path");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");


const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL_NAME = "gemini-2.0-flash";

// Embeddings model for Qdrant
const EMBEDDING_MODEL_NAME = "text-embedding-004"; // 768-dim embeddings

console.log("Gemini key loaded?", !!process.env.GEMINI_API_KEY);


// --- Qdrant setup ---
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

const QDRANT_COLLECTION = "keysync_knowledge";
const QDRANT_LEAD_MEMORY_COLLECTION = "lead_memory";
const QDRANT_VECTOR_DIM = 768;

// Default firm ID (can be overridden via env var)
const DEFAULT_FIRM_ID = process.env.FIRM_ID || "demo_firm";

async function ensureKnowledgeCollection() {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    console.warn("Qdrant env vars not set, skipping collection init");
    return;
  }

  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === QDRANT_COLLECTION
    );

    if (!exists) {
      console.log("Creating Qdrant collection:", QDRANT_COLLECTION);
      await qdrantClient.createCollection(QDRANT_COLLECTION, {
        vectors: {
          size: QDRANT_VECTOR_DIM,
          distance: "Cosine"
        }
      });
      console.log("Qdrant collection created");
    } else {
      console.log("Qdrant collection already exists");
    }
  } catch (err) {
    console.error("Error ensuring Qdrant collection:", err);
  }
}

/**
 * Ensures the lead_memory collection exists in Qdrant.
 * This collection stores processed leads with their outcomes for adaptive learning.
 */
async function ensureLeadMemoryCollection() {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    console.warn("Qdrant env vars not set, skipping lead_memory collection init");
    return false;
  }

  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === QDRANT_LEAD_MEMORY_COLLECTION
    );

    if (!exists) {
      console.log("Creating Qdrant collection:", QDRANT_LEAD_MEMORY_COLLECTION);
      await qdrantClient.createCollection(QDRANT_LEAD_MEMORY_COLLECTION, {
        vectors: {
          size: QDRANT_VECTOR_DIM,
          distance: "Cosine"
        }
      });
      console.log("✅ Lead memory collection created");
      return true;
    } else {
      console.log("Lead memory collection already exists");
      return true;
    }
  } catch (err) {
    console.error("Error ensuring lead_memory collection:", err);
    return false;
  }
}


// --- Agent System Prompt (Shared by all agents) ---
const BASE_AGENT_SYSTEM_PROMPT = `
You are an AI real estate lead specialist working for a Dubai brokerage, responding to clients over WhatsApp.

Goal:
- Turn every inbound message into a high-quality, qualified lead.
- Sound like a real human agent, not a chatbot.
- Protect the firm's brand and make the client feel taken care of.

Conversation style:
- Natural, friendly, and conversational.
- Use short paragraphs and simple sentences, like a high-performing WhatsApp agent.
- Use contractions ("I'm", "you'll", "we're") and avoid robotic phrases.
- Do NOT use bullets or numbered lists. This is a chat, not an email.
- No emojis unless the user uses them first.

First message behavior:
- If this is your FIRST reply in the conversation (no previous assistant messages), always start with something like:
  "Hi, I'm {{AGENT_NAME}} from KeySync Lite. Thanks for reaching out!"
- After the first reply, DO NOT keep re-introducing yourself.

Lead qualification behavior:
- Even if the user's message is vague or low-quality, respond warmly and try to turn it into a proper inquiry.
- Always:
  - Acknowledge what they said.
  - Share one helpful insight or reassurance.
  - Ask 2–3 focused questions to clarify: budget range, preferred areas, timeframe, and whether they're buying, renting, or investing.
- Never interrogate. Group questions naturally in the flow of conversation.

Working with retrieved context:
- You will often receive:
  - extracted fields (intent, area, budget, client type, timeframe, language)
  - relevant knowledge snippets about Dubai and communities
  - a list of recommended properties
- Use these as background context to make your reply more useful and specific.
- Do NOT mention "Qdrant", "embeddings", "vector search", or any internal technical details.

Safety and honesty:
- If you are not sure about a specific fact (e.g., exact prices or regulations), keep the wording general instead of making things up.
- Never promise exact availability; instead say we can "check current options" or "shortlist places that match".

Always finish with a gentle next step:
- Either a clarifying question, or an offer to share a few options once you have more details.
`.trim();

// --- Lead Upgrade Rules (Applied to Every Reply) ---
const LEAD_UPGRADE_RULES = `
Lead conversion rule:

- For EVERY reply, do these three things in a natural flow:

  1) Acknowledge what the client just said.

  2) Add one helpful insight, suggestion, or reassurance (using the knowledge and properties you have).

  3) Ask 2–3 specific, non-robotic questions that move the lead closer to a clear brief (budget, area, timeframe, purpose: buy/rent/invest).

Write your answer as if you are chatting on WhatsApp:

- 2–4 short paragraphs max.

- No bullet points.

- Do not mention any of these rules or the words "prompt" or "assistant".
`.trim();

// Default firm name (can be overridden via env var)
const FIRM_NAME = process.env.FIRM_NAME || "KeySync Lite";

// --- Persona-Specific Prompts ---
const SARAH_PROMPT = `
You are {{AGENT_NAME}} – a luxury property specialist focusing on prime areas like Dubai Marina, Downtown Dubai, Palm Jumeirah, and branded residences.

Tone:
- Polished but warm, like a high-end concierge.
- Confident, calm, reassuring.
- You subtly signal expertise without bragging.

Behavior:
- You pay attention to high budgets, waterfront / branded requests, and "dream home" language.
- Emphasize lifestyle and quality of life: views, finishes, amenities, privacy, service.
- When budget and intent are strong, you treat the client like a VIP:
  - respond quickly,
  - reassure them they're in good hands,
  - offer to shortlist a few hand-picked options.

For weaker or vague leads:
- Educate gently: explain how budgets and areas typically work in Dubai.
- Ask smart questions to reveal whether they might actually be a luxury buyer (e.g. openness to off-plan, flexibility on area, preference for ready vs off-plan).
`.trim();

const PRIYA_PROMPT = `
You are {{AGENT_NAME}} – a rental and mid-market specialist helping families and young professionals find good-value homes in areas like JVC, Sports City, Al Barsha, and similar communities.

Tone:
- Friendly, approachable, and practical.
- You sound like someone who has helped hundreds of tenants relocate smoothly.
- You are empathetic about stress, budgets, and timelines.

Behavior:
- Quickly clarify: renting or buying, move-in date, budget range, type of property, and key priorities (commute, schools, furnished vs unfurnished).
- You give simple, actionable advice: which areas fit which budgets, and what tradeoffs to expect.
- You always aim to turn vague messages like "I'm moving to Dubai, need a place" into a clear, qualified brief.

For low-quality leads:
- Don't dismiss them. Use questions to make them more concrete:
  - "Roughly what monthly budget are you thinking?"
  - "Do you prefer to be closer to work, schools, or city center?"
- Your goal is to upgrade noisy inquiries into clean, ready-to-work leads.
`.trim();

const OMAR_PROMPT = `
You are {{AGENT_NAME}} – an investment and off-plan advisor who works with buyers focused on ROI, long-term appreciation, and payment plans.

Tone:
- Strategic, calm, and numbers-aware without being too technical.
- You build trust by explaining concepts clearly and avoiding hype.
- You sound like a professional advisor, not a salesperson.

Behavior:
- First, clarify if the client is:
  - an end-user who also cares about ROI,
  - or a pure investor looking for yield and growth.
- Ask about: budget, preferred areas or developers, risk tolerance (ready vs off-plan), and expected holding period.
- When appropriate, reference general market patterns:
  - which areas are strong for rentals,
  - which projects attract investors with structured payment plans.

For low-quality messages:
- If someone just writes "give me some property photos" or similar, respond by:
  - acknowledging the request,
  - briefly explaining that to send the right options, you need a bit more detail,
  - asking 2–3 smart questions (budget, area, purpose: live or invest).
- You always aim to turn a vague request into a clear investment brief.
`.trim();

// --- Persona definitions (Dubai specialists) ---
const PERSONAS = [
  {
    id: "sarah",
    name: "Sarah Al Mansoori",
    specialty: "Luxury Property Specialist",
    areas: ["Palm Jumeirah", "Downtown Dubai", "Dubai Marina"],
    type: "luxury",
    description:
      "Handles high-budget luxury sales for prime Dubai areas. Polished, concierge-style communication."
  },
  {
    id: "omar",
    name: "Omar Haddad",
    specialty: "Off-Plan Investment Advisor",
    areas: ["Dubai Creek Harbour", "Sobha Hartland", "Business Bay"],
    type: "off-plan",
    description:
      "Helps investors with off-plan launches, payment plans, and ROI-focused decisions."
  },
  {
    id: "priya",
    name: "Priya Varma",
    specialty: "Rental Specialist",
    areas: ["JVC", "Sports City", "Al Barsha"],
    type: "rental",
    description:
      "Focuses on mid-budget rentals for expat families and working professionals."
  }
];

// --- Lead scoring helper ---
// Returns { lead_score: 0-10, priority: "low" | "medium" | "high" }
function computeLeadScore(analysis) {
  let score = 0;

  // Basic weight: intent
  if (analysis.intent === "buy") score += 3;
  if (analysis.intent === "rent") score += 2;

  // Area known vs unknown
  if (analysis.area && analysis.area !== "Unknown") score += 2;

  // Timeframe
  if (analysis.timeframe && analysis.timeframe !== "unspecified") score += 2;

  // Budget – if we have a number, give some points
  if (typeof analysis.budget === "number" && analysis.budget > 0) {
    // treat bigger budgets as higher score, but cap it
    if (analysis.budget >= 4000000) score += 3;
    else if (analysis.budget >= 1000000) score += 2;
    else score += 1;
  }

  // Client type: investor/end-user is better than unknown
  if (analysis.client_type === "investor" || analysis.client_type === "end-user") {
    score += 1;
  }

  // Clamp score between 0 and 10
  if (score > 10) score = 10;

  let priority = "low";
  if (score >= 4 && score < 7) priority = "medium";
  if (score >= 7) priority = "high";

  return { lead_score: score, priority };
}


// --- Simple lead analysis (no AI yet) ---
function analyzeLeadNaive(text) {
  const lower = (text || "").toLowerCase();

  // Intent: rent vs buy (very naive for now)
  let intent = "buy";
  if (lower.includes("rent") || lower.includes("rental") || lower.includes("lease")) {
    intent = "rent";
  }

  // Area: we just look for some keywords
  let area = "Unknown";
  if (lower.includes("jvc") || lower.includes("jumeirah village circle")) {
    area = "JVC";
  } else if (lower.includes("dubai hills")) {
    area = "Dubai Hills";
  } else if (lower.includes("dubai creek")) {
    area = "Dubai Creek Harbour";
  } else if (lower.includes("palm")) {
    area = "Palm Jumeirah";
  }

  // Very simple timeframe guess
  let timeframe = "unspecified";
  if (lower.includes("next month")) timeframe = "next month";
  if (lower.includes("2-3 months") || lower.includes("2 to 3 months")) {
    timeframe = "2-3 months";
  }

  // Budget – keep null for now, we’ll add AI later
  const budget = null;

  // Client type guess
  let client_type = "unknown";
  if (lower.includes("invest")) client_type = "investor";
  if (lower.includes("moving") || lower.includes("relocating")) client_type = "end-user";

  // Language (for now always 'en')
  const language = "en";

  const base = { intent, budget, area, timeframe, client_type, language };
  const { lead_score, priority } = computeLeadScore(base);

  return { ...base, lead_score, priority };
}

// --- Real lead analysis using Gemini (AI) with safe fallback ---
async function analyzeLeadGemini(text) {
  // If no key, just fall back immediately
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY missing, using naive analysis.");
    return analyzeLeadNaive(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

    const prompt = `
  You are an AI assistant for a Dubai real estate brokerage.
  Your job is to extract structured data from raw lead messages.

  For the given lead message, return a JSON object with this exact shape:

  {
    "intent": "buy" | "rent",
    "budget": number | null,
    "area": string,
    "timeframe": string,
    "client_type": "investor" | "end-user" | "unknown",
    "language": "en" | "ar" | "unknown",
    "lead_score": number,          // 0 to 10, higher = more promising
    "priority": "low" | "medium" | "high"
  }

  Rules:
  - "intent" is "buy" if they want to purchase; "rent" if they want to rent.
  - "budget" should be a number in AED. If no budget or it's unclear, use null.
    - If they say things like "1.7M", treat it as 1700000.
    - If they say things like "90k", treat it as 90000.
  - "area" should be a short area name like "JVC", "Palm Jumeirah", "Dubai Hills", "Dubai Creek Harbour" if possible.
  - "timeframe" is a free-text phrase like "next month", "2-3 months", "unspecified".
  - "client_type" is "investor" if they mention investment, ROI, yield etc; "end-user" if they are moving/living there; otherwise "unknown".
  - "language" is based on the message: "en" for English, "ar" for Arabic, or "unknown" if not obvious.
  - "lead_score" should be from 0 to 10 based on seriousness, clarity, budget, and timeframe.
  - "priority" should be:
    - "high" for serious, high-value, clear-intent leads,
    - "medium" for decent leads,
    - "low" for vague, low-intent, or spammy leads.

  Very important:
  - Respond with ONLY the JSON. No explanation, no extra text.

  Lead message:
  """${text}"""
    `.trim();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text().trim();

    console.log("Gemini analysis raw output:", rawText);

    // Try to extract JSON from the response
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    const jsonString = rawText.slice(start, end + 1);
    const data = JSON.parse(jsonString);

    const base = {
      intent: data.intent || "buy",
      budget: typeof data.budget === "number" ? data.budget : null,
      area: data.area || "Unknown",
      timeframe: data.timeframe || "unspecified",
      client_type: data.client_type || "unknown",
      language: data.language || "unknown"
    };

    let lead_score = typeof data.lead_score === "number" ? data.lead_score : null;
    let priority = typeof data.priority === "string" ? data.priority : null;

    // If Gemini didn't give good scoring, compute it ourselves
    if (
      lead_score === null ||
      lead_score < 0 ||
      lead_score > 10 ||
      !["low", "medium", "high"].includes((priority || "").toLowerCase())
    ) {
      const computed = computeLeadScore(base);
      lead_score = computed.lead_score;
      priority = computed.priority;
    }

    return { ...base, lead_score, priority };
  } catch (err) {
    console.error("analyzeLeadGemini error, falling back to naive:", err);
    return analyzeLeadNaive(text);
  }
}

/**
 * Chooses persona based on analysis + text, with adaptive learning from lead_memory.
 * Returns persona object and metadata about the decision.
 */
async function choosePersonaWithMemory(analysis, text, leadEmbedding, firmId = DEFAULT_FIRM_ID) {
  // Step A: Baseline persona selection using existing rules
  const baselinePersona = choosePersona(analysis, text);

  // Step B: Query lead_memory for similar leads
  const similarLeads = await findSimilarLeads(leadEmbedding, firmId, 20);

  if (similarLeads.length === 0) {
    // No memory data yet - use baseline
    return {
      persona: baselinePersona,
      decision_metadata: {
        method: "baseline_rules",
        similar_leads_count: 0,
        persona_counts: {}
      }
    };
  }

  // Step C: Analyze outcomes by persona
  const personaOutcomes = {};
  PERSONAS.forEach(p => {
    personaOutcomes[p.id] = {
      converted: 0,
      lost: 0,
      in_progress: 0,
      total: 0
    };
  });

  similarLeads.forEach(lead => {
    const personaId = lead.persona_used;
    if (personaOutcomes[personaId]) {
      personaOutcomes[personaId].total++;
      if (lead.outcome === "converted") personaOutcomes[personaId].converted++;
      else if (lead.outcome === "lost") personaOutcomes[personaId].lost++;
      else personaOutcomes[personaId].in_progress++;
    }
  });

  // Step D: Calculate conversion rates and choose best persona
  let bestPersona = baselinePersona;
  let bestConversionRate = 0;
  const personaStats = {};

  PERSONAS.forEach(p => {
    const stats = personaOutcomes[p.id];
    const conversionRate = stats.total > 0 ? stats.converted / stats.total : 0;
    personaStats[p.id] = {
      conversion_rate: conversionRate,
      converted: stats.converted,
      lost: stats.lost,
      total: stats.total
    };

    // Only override baseline if we have significant data (at least 3 leads) and better conversion
    if (stats.total >= 3 && conversionRate > bestConversionRate) {
      bestConversionRate = conversionRate;
      bestPersona = p;
    }
  });

  const method = bestPersona.id === baselinePersona.id ? "baseline_rules" : "memory_optimized";

  console.log(`Persona selection: ${method} → ${bestPersona.id} (${(bestConversionRate * 100).toFixed(1)}% conversion rate)`);

  return {
    persona: bestPersona,
    decision_metadata: {
      method,
      similar_leads_count: similarLeads.length,
      persona_counts: personaStats,
      baseline_persona: baselinePersona.id,
      selected_persona: bestPersona.id,
      conversion_rate: bestConversionRate
    }
  };
}

// --- Choose persona based on naive analysis (baseline, kept for backward compatibility) ---
function choosePersona(analysis, text) {
  const lower = (text || "").toLowerCase();

  // Rentals → Priya
  if (analysis.intent === "rent") {
    return PERSONAS.find((p) => p.id === "priya");
  }

  // Off-plan / investment keywords → Omar
  if (
    lower.includes("off-plan") ||
    lower.includes("off plan") ||
    lower.includes("investment") ||
    lower.includes("roi") ||
    lower.includes("payment plan")
  ) {
    return PERSONAS.find((p) => p.id === "omar");
  }

  // High-end area keywords → Sarah
  if (
    lower.includes("palm") ||
    lower.includes("downtown") ||
    lower.includes("marina")
  ) {
    return PERSONAS.find((p) => p.id === "sarah");
  }

  // Default: Omar (off-plan/buy)
  return PERSONAS.find((p) => p.id === "omar");
}

/**
 * Builds conversation context block for the AI prompt.
 * Handles first message introduction logic cleanly.
 */
function buildConversationContextBlock(isFirstMessage, agentName, firmName) {
  if (isFirstMessage) {
    return `This is your FIRST message in this conversation. You MUST start with: "Hi, I'm ${agentName} from ${firmName}. Thanks for reaching out!" Then continue naturally.`;
  } else {
    return `This is NOT your first message. Do NOT re-introduce yourself. Continue the conversation naturally.`;
  }
}

/**
 * Builds the full system prompt for Gemini by combining base prompt, persona-specific prompt,
 * conversation context, and lead upgrade rules.
 * 
 * @param {string} agentKey - Agent identifier: "sarah", "priya", or "omar"
 * @param {boolean} isFirstMessage - Whether this is the first message in the conversation
 * @returns {string} Complete system prompt string
 */
function buildAgentSystemPrompt(agentKey, isFirstMessage) {
  // Find persona from PERSONAS array
  const persona = PERSONAS.find(p => p.id === agentKey);
  if (!persona) {
    throw new Error(`Unknown agent key: ${agentKey}`);
  }

  const agentName = persona.name;

  // Get persona-specific prompt
  let personaPrompt;
  if (agentKey === "sarah") {
    personaPrompt = SARAH_PROMPT;
  } else if (agentKey === "priya") {
    personaPrompt = PRIYA_PROMPT;
  } else if (agentKey === "omar") {
    personaPrompt = OMAR_PROMPT;
  } else {
    // Fallback to generic
    personaPrompt = `
Your persona: ${persona.name}
Your specialty: ${persona.specialty}
Your areas of expertise: ${persona.areas.join(", ")}
Your communication style: ${persona.description}
`.trim();
  }

  // Replace placeholders in base prompt and persona prompt
  const systemPrompt = BASE_AGENT_SYSTEM_PROMPT
    .replace(/\{\{AGENT_NAME\}\}/g, agentName)
    .replace(/\{\{FIRM_NAME\}\}/g, FIRM_NAME);

  const personaPromptResolved = personaPrompt
    .replace(/\{\{AGENT_NAME\}\}/g, agentName);

  const conversationContext = buildConversationContextBlock(isFirstMessage, agentName, FIRM_NAME);

  // Combine all parts
  return [
    systemPrompt,
    personaPromptResolved,
    conversationContext,
    LEAD_UPGRADE_RULES,
  ].join("\n\n");
}

// --- Basic reply generator (template style, fallback only) ---
function generateBasicReply(analysis, persona, isFirstMessage = true) {
  const { intent, area, timeframe } = analysis;
  const intentText = intent === "rent" ? "a rental" : "a property to buy";

  let opener = isFirstMessage 
    ? `Hi, I'm ${persona.name} from ${FIRM_NAME}. Thanks for reaching out!`
    : `Thanks for that info!`;

  if (area && area !== "Unknown") {
    opener += ` ${area} is a great choice if you're looking for ${intentText}.`;
  }

  let followUpQuestion = "";
  if (intent === "rent") {
    followUpQuestion =
      " To help me find the best options, could you tell me your budget range and when you're planning to move?";
  } else {
    followUpQuestion =
      " To better assist you, what's your budget range and are you looking to live in the property or invest?";
  }

  return `${opener}${followUpQuestion}`;
}

// --- AI reply generator using Gemini + Qdrant context + Properties ---
async function generateReplyAI(analysis, persona, qdrantSnippets, recommendedProperties = [], userRequestedProperties = false, isFirstMessage = true) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

    const knowledgeText =
      (qdrantSnippets || [])
        .map((s, idx) => `Snippet ${idx + 1}: ${s.text}`)
        .join("\n");

    // Format properties for the prompt
    let propertiesText;
    if (userRequestedProperties) {
      if (recommendedProperties.length > 0) {
        propertiesText = recommendedProperties
          .map((p, idx) => 
            `Property ${idx + 1}: ${p.title} in ${p.area}. ${p.bedrooms} bedrooms. Price: ${p.price.toLocaleString()} ${p.currency}. ${p.description}`
          )
          .join("\n");
      } else {
        propertiesText = "(User asked for properties but none matched their criteria - apologize warmly and offer to help find alternatives)";
      }
    } else {
      propertiesText = "(User did NOT request properties - DO NOT mention any properties, listings, or photos in your reply. Keep it conversational and focus on qualifying the lead with questions.)";
    }

    // Build the full system prompt using helper function
    const fullSystemPrompt = buildAgentSystemPrompt(persona.id, isFirstMessage);

    // Build the full prompt
    const prompt = `
${fullSystemPrompt}

---

CRITICAL INSTRUCTIONS FOR THIS REPLY:

${userRequestedProperties 
  ? 'The user EXPLICITLY asked to see properties/listings/photos. Mention the properties provided below naturally and offer to share more details or photos.' 
  : 'The user did NOT ask to see properties. DO NOT mention any properties, listings, or photos. Focus on qualifying the lead by asking 2-3 natural questions about budget, area preferences, timeframe, and purpose (buy/rent/invest).'}

---

Lead analysis (extracted from user's message):
${JSON.stringify(analysis, null, 2)}

Knowledge snippets about Dubai (use as background context):
${knowledgeText || "(no extra snippets)"}

Recommended properties (ONLY mention if user requested them):
${propertiesText}

---

Write your WhatsApp reply now. Remember:
- Natural, conversational tone
- Short paragraphs (2-4 max)
- Use contractions
- No bullets or lists
- Follow the lead upgrade rule: acknowledge → insight → 2-3 questions
- End with a gentle next step

Only output the message text the client should see, no explanations or JSON.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    return text;
  } catch (err) {
    console.error("generateReplyAI error, falling back to basic reply:", err);
    // Fallback: use the template reply so we never crash
    return generateBasicReply(analysis, persona, isFirstMessage);
  }
}

// --- Embedding helper using Gemini ---
async function embedText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
    const result = await model.embedContent(text);
    // text-embedding-004 returns embedding.values
    return result.embedding.values;
  } catch (err) {
    console.error("embedText error:", err);
    throw err; // let the caller decide what to do
  }
}

// --- Test route for embeddings only ---
app.get("/api/test-embedding", async (req, res) => {
  try {
    const vec = await embedText("hello from KeySync");
    res.json({ length: vec.length, sample: vec.slice(0, 5) });
  } catch (err) {
    console.error("Embedding test error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Seed Qdrant knowledge base (dev-only) ---
app.post("/api/dev/seed-knowledge", async (req, res) => {
  try {
    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      return res.status(500).json({ error: "Qdrant env vars not set" });
    }

    await ensureKnowledgeCollection();

    // Simple curated snippets – you can tweak text later
    const items = [
      {
        external_id: "area_jvc_rentals",
        text:
          "Jumeirah Village Circle (JVC) is popular for mid-budget rentals. Great for young professionals and small families, with many 1BR and 2BR options around 60k–90k AED.",
        tags: { type: "area", area: "JVC", intent: "rent" }
      },
      {
        external_id: "area_palm_luxury",
        text:
          "Palm Jumeirah is a prime luxury area in Dubai with beachfront apartments and villas. Typical budgets start from 4M AED and go much higher for villas.",
        tags: { type: "area", area: "Palm Jumeirah", segment: "luxury" }
      },
      {
        external_id: "area_dubai_creek_offplan",
        text:
          "Dubai Creek Harbour is one of the key off-plan investment areas with strong interest from investors looking for payment plans and long-term capital appreciation.",
        tags: { type: "area", area: "Dubai Creek Harbour", intent: "buy", client_type: "investor" }
      },
      {
        external_id: "persona_sarah_tone",
        text:
          "Sarah Al Mansoori speaks in a polished, calm, concierge-style tone. She reassures high-net-worth buyers, references lifestyle, views, and exclusivity.",
        tags: { type: "persona_style", persona_id: "sarah" }
      },
      {
        external_id: "persona_omar_tone",
        text:
          "Omar Haddad focuses on ROI, payment plans, launch phases, and exit strategies. He uses clear numeric examples and keeps the tone practical and investor-friendly.",
        tags: { type: "persona_style", persona_id: "omar" }
      },
      {
        external_id: "persona_priya_tone",
        text:
          "Priya Varma is friendly and practical. She asks about move-in dates, family size, commute, and school proximity. She emphasizes convenience and budget-fit.",
        tags: { type: "persona_style", persona_id: "priya" }
      },
      {
        id: "faq_rent_docs",
        text:
          "For rentals in Dubai, tenants usually need passport copy, visa copy, Emirates ID, and sometimes salary certificate. Rental cheques are typically 1–4 cheques per year.",
        tags: { type: "faq", topic: "rental_process" }
      },
      {
        id: "faq_offplan_risks",
        text:
          "Off-plan investments come with construction and handover risk, but reputable developers and RERA regulations in Dubai reduce this compared to many other markets.",
        tags: { type: "faq", topic: "offplan" }
      }
    ];

    const points = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      let vector;
      try {
        vector = await embedText(item.text);
      } catch (err) {
        console.warn("Falling back to dummy vector for", item.external_id);
        vector = Array(QDRANT_VECTOR_DIM).fill(0);
      }

      points.push({
        id: i + 1, // numeric ID, Qdrant is happy now
        vector,
        payload: {
          external_id: item.external_id,
          text: item.text,
          ...item.tags
        }
      });
    }

    await qdrantClient.upsert(QDRANT_COLLECTION, { points });

    return res.json({
      success: true,
      inserted: items.length
    });
  } catch (err) {
    console.error("Error seeding Qdrant knowledge:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Qdrant knowledge retrieval helper ---
async function getKnowledgeForLead(analysis, persona) {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    console.warn("Qdrant env vars not set – skipping knowledge lookup");
    return [];
  }

  try {
    // Build a simple query text from analysis + persona
    const parts = [];
    if (analysis.area) parts.push(`Area: ${analysis.area}`);
    if (analysis.intent) parts.push(`Intent: ${analysis.intent}`);
    if (analysis.client_type) parts.push(`Client type: ${analysis.client_type}`);
    if (persona && persona.type) parts.push(`Persona type: ${persona.type}`);

    const queryText =
      parts.join(". ") || "Dubai real estate lead for rentals and sales.";

    console.log("Qdrant query text:", queryText);

    // Embed query text with Gemini
    const queryVector = await embedText(queryText);

    // 🔥 IMPORTANT: search() returns an ARRAY directly
    const searchResult = await qdrantClient.search(QDRANT_COLLECTION, {
      vector: queryVector,
      limit: 5,
      with_payload: true,
      with_vectors: false
    });

    console.log("Qdrant search returned", searchResult.length, "points");

    const items = (searchResult || []).map((pt) => {
      const payload = pt.payload || {};
      return {
        text: payload.text,
        score: pt.score,
        payload
      };
    });

    return items;
  } catch (err) {
    console.error("getKnowledgeForLead error:", err);
    return [];
  }
}

// --- Check if user is asking for property listings/photos ---
// STRICT: Only returns true for EXPLICIT requests to see properties/listings/photos
function isRequestingProperties(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase().trim();
  
  // STRICT PATTERNS: Require explicit action verbs + property-related terms
  // Pattern 1: "show me [properties/listings/photos/images]"
  const showMePattern = /(show\s+me|show|display|send\s+me|send|share\s+me|share)\s+(me\s+)?(the\s+)?(properties|listings|photos?|pictures?|images?)/i;
  
  // Pattern 2: "can/could/would you show/suggest [properties/listings/photos]"
  const canYouShowPattern = /(can|could|would)\s+(you\s+)?(show|send|share|suggest)\s+(me\s+)?(some|any|the\s+)?(properties|listings|photos?|pictures?|images?)/i;
  
  // Pattern 3: "I want to see [properties/listings/photos]"
  const wantToSeePattern = /(want|would\s+like|like)\s+(to\s+)?(see|view|look\s+at)\s+(properties|listings|photos?|pictures?|images?)/i;
  
  // Pattern 4: "let me see [properties/listings/photos]"
  const letMeSeePattern = /(let\s+me\s+see|can\s+i\s+see)\s+(properties|listings|photos?|pictures?|images?)/i;
  
  // Pattern 5: Direct requests like "properties please", "show listings", "photos?"
  const directRequestPattern = /^(show|send|share|display|give)\s+(me\s+)?(some\s+)?(properties|listings|photos?|pictures?|images?)/i;
  
  // Pattern 6: "do you have [any] properties/listings to show"
  const haveToShowPattern = /(do\s+you\s+have|have\s+you\s+got)\s+(any\s+)?(properties|listings|photos?|pictures?|images?)\s+(to\s+)?(show|send|share)/i;
  
  // Pattern 7: Explicit photo/image requests - "give me photos", "suggest photos", etc.
  const photoImagePattern = /(show|send|share|see|view|give|suggest)\s+(me\s+)?(some\s+)?(the\s+)?(photos?|pictures?|images?|properties|listings)/i;
  
  // Pattern 8: "what properties/listings do you have" (explicit property term required)
  const whatPropertiesPattern = /what\s+(properties|listings|photos?|pictures?|images?)\s+(do\s+you\s+have|are\s+available)/i;
  
  // Pattern 9: "give me [some] [property] photos/properties"
  const giveMePattern = /give\s+me\s+(some\s+)?(property\s+)?(photos?|pictures?|images?|properties|listings)/i;
  
  // Pattern 10: "suggest me [some] photos/properties"
  const suggestMePattern = /suggest\s+(me\s+)?(some\s+)?(photos?|pictures?|images?|properties|listings)/i;
  
  // Check all patterns
  const patterns = [
    showMePattern,
    canYouShowPattern,
    wantToSeePattern,
    letMeSeePattern,
    directRequestPattern,
    haveToShowPattern,
    photoImagePattern,
    whatPropertiesPattern,
    giveMePattern,
    suggestMePattern
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Writes a processed lead into the lead_memory collection for adaptive learning.
 * This function is non-blocking and won't break lead processing if it fails.
 */
async function writeLeadToMemory(leadData) {
  const {
    text,           // Original lead message
    channel,        // "whatsapp" | "gmail" | "portal"
    analysis,       // Full analysis object
    persona,        // Selected persona
    recommendedProperties, // Array of property objects
    firmId = DEFAULT_FIRM_ID
  } = leadData;

  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    return; // Silently skip if Qdrant not configured
  }

  try {
    // Ensure collection exists
    await ensureLeadMemoryCollection();

    // Generate embedding from original lead text
    const leadVector = await embedText(text || "");

    // Extract property IDs from recommended properties
    const propertyIds = (recommendedProperties || []).map(p => p.id || p.title).filter(Boolean);

    // Generate short summary from analysis
    const summaryParts = [];
    if (analysis.intent) summaryParts.push(`Looking to ${analysis.intent}`);
    if (analysis.area && analysis.area !== "Unknown") summaryParts.push(`in ${analysis.area}`);
    if (analysis.budget && analysis.budget > 0) {
      summaryParts.push(`budget ${(analysis.budget / 1000000).toFixed(1)}M AED`);
    }
    const shortSummary = summaryParts.length > 0 
      ? summaryParts.join(", ") 
      : "General property inquiry";

    // Create payload for lead_memory
    const payload = {
      firm_id: firmId,
      channel: channel || "unknown",
      lead_score: analysis.lead_score || 0,
      priority: analysis.priority || "low",
      persona_used: persona?.id || "unknown",
      outcome: "in_progress", // Default - will be updated when we get CRM feedback
      property_ids: propertyIds,
      timestamp: new Date().toISOString(),
      short_summary: shortSummary,
      // Store additional context for future analysis
      intent: analysis.intent,
      area: analysis.area,
      client_type: analysis.client_type,
      budget: analysis.budget
    };

    // Generate unique ID for this lead (timestamp + hash of text)
    const leadId = `lead_${Date.now()}_${Buffer.from(text || "").toString("base64").substring(0, 16)}`;

    // Upsert to lead_memory collection
    await qdrantClient.upsert(QDRANT_LEAD_MEMORY_COLLECTION, {
      points: [{
        id: leadId,
        vector: leadVector,
        payload: payload
      }]
    });

    console.log("✅ Lead written to memory:", { leadId, persona: persona?.id, propertyCount: propertyIds.length });
  } catch (err) {
    // Non-blocking: log error but don't throw
    console.error("⚠️ Failed to write lead to memory (non-critical):", err.message);
  }
}

/**
 * Searches for similar past leads in lead_memory and returns them with outcomes.
 * Used for adaptive property ranking and persona routing.
 */
async function findSimilarLeads(leadEmbedding, firmId = DEFAULT_FIRM_ID, limit = 10) {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    return [];
  }

  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const hasCollection = collections.collections.some(c => c.name === QDRANT_LEAD_MEMORY_COLLECTION);
    
    if (!hasCollection) {
      console.log("Lead memory collection doesn't exist yet - no similar leads to find");
      return [];
    }

    // Search for similar leads using vector similarity
    const similarLeads = await qdrantClient.search(QDRANT_LEAD_MEMORY_COLLECTION, {
      vector: leadEmbedding,
      limit: limit,
      with_payload: true,
      with_vectors: false,
      filter: {
        must: [
          {
            key: "firm_id",
            match: { value: firmId }
          }
        ]
      }
    });

    return similarLeads.map(pt => ({
      short_summary: pt.payload?.short_summary || "Lead inquiry",
      persona_used: pt.payload?.persona_used || "unknown",
      outcome: pt.payload?.outcome || "in_progress",
      channel: pt.payload?.channel || "unknown",
      timestamp: pt.payload?.timestamp,
      property_ids: pt.payload?.property_ids || [],
      lead_score: pt.payload?.lead_score || 0,
      priority: pt.payload?.priority || "low",
      similarity_score: pt.score
    }));
  } catch (err) {
    console.error("Error finding similar leads:", err);
    return [];
  }
}

/**
 * Searches and re-ranks properties using lead_memory conversion outcomes.
 * Properties that converted in similar past leads get a boost in ranking.
 */
async function searchAndRerankPropertiesForLead(leadEmbedding, analysis, text, firmId = DEFAULT_FIRM_ID) {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    console.warn("Qdrant env vars not set – skipping property lookup");
    return [];
  }

  try {
    // Build query text from lead message and analysis
    const parts = [];
    
    // Always include "Dubai" as base location
    parts.push("Dubai");
    
    if (analysis.area && analysis.area !== "Unknown" && analysis.area !== "unknown") {
      parts.push(analysis.area);
    }
    if (analysis.intent) {
      parts.push(analysis.intent === "rent" ? "rental" : "for sale");
    }
    if (analysis.budget && analysis.budget > 0) {
      const budgetM = (analysis.budget / 1000000).toFixed(1);
      parts.push(`budget ${budgetM}M AED`);
    }
    
    // Include original text for better matching (limit to first 150 chars)
    if (text) {
      const textSnippet = text.substring(0, 150).trim();
      if (textSnippet) {
        parts.push(textSnippet);
      }
    }

    // Fallback to generic Dubai property query if no parts
    const queryText = parts.length > 0 ? parts.join(". ") : "Dubai property apartment villa";

    console.log("Property query text:", queryText);

    // Use the provided embedding or generate one
    const queryVector = leadEmbedding || await embedText(queryText);

    // Ensure properties collection exists before searching
    try {
      const collections = await qdrantClient.getCollections();
      const hasPropertiesCollection = collections.collections.some(
        (c) => c.name === "properties"
      );
      if (!hasPropertiesCollection) {
        console.error("❌ Qdrant 'properties' collection not found. Seed script not run?");
        console.log("Existing collections:", collections.collections.map((c) => c.name));
        return [];
      }
    } catch (err) {
      console.error("Error checking Qdrant collections:", err);
    }

    // Search properties collection - increase limit to 5 for better results
    const searchResult = await qdrantClient.search("properties", {
      vector: queryVector,
      limit: 5,
      with_payload: true,
      with_vectors: false,
      score_threshold: 0.3  // Lower threshold to get more results even with partial matches
    });

    console.log("Property search returned", searchResult.length, "properties");
    if (searchResult.length > 0) {
      console.log("Top property match score:", searchResult[0].score);
    }
    
    // If no results, try a more generic search
    if (searchResult.length === 0) {
      console.log("No properties found with specific query, trying generic Dubai property search");
      const genericQuery = "Dubai property apartment villa";
      const genericVector = await embedText(genericQuery);
      const genericResult = await qdrantClient.search("properties", {
        vector: genericVector,
        limit: 3,
        with_payload: true,
        with_vectors: false
      });
      console.log("Generic search returned", genericResult.length, "properties");
      if (genericResult.length > 0) {
        // Use generic results
        const properties = genericResult.map((pt) => {
          const payload = pt.payload || {};
          return {
            id: payload.id,
            title: payload.title,
            description: payload.description,
            area: payload.area,
            bedrooms: payload.bedrooms,
            price: payload.price,
            currency: payload.currency || "AED",
            images: payload.images || []
          };
        });
        return properties;
      }
    }

    // Step B: Find similar leads in lead_memory to get conversion data
    const similarLeads = await findSimilarLeads(queryVector, firmId, 10);
    
    // Step C: Build conversion score map from similar leads
    const propertyConversionScores = {};
    const propertyLossCounts = {};
    
    similarLeads.forEach(lead => {
      const propertyIds = lead.property_ids || [];
      propertyIds.forEach(propId => {
        if (lead.outcome === "converted") {
          propertyConversionScores[propId] = (propertyConversionScores[propId] || 0) + 1;
        } else if (lead.outcome === "lost") {
          propertyLossCounts[propId] = (propertyLossCounts[propId] || 0) + 1;
        }
      });
    });

    console.log(`Found ${similarLeads.length} similar leads with conversion data`);

    // Step D: Re-rank properties using conversion scores
    const ALPHA = 0.15; // Boost factor for conversion history
    const BETA = 0.05;  // Penalty factor for loss history
    
    const rerankedProperties = (searchResult || []).map((pt) => {
      const payload = pt.payload || {};
      const propertyId = payload.id || payload.title;
      const baseScore = pt.score || 0;
      
      // Calculate conversion boost
      const conversionCount = propertyConversionScores[propertyId] || 0;
      const lossCount = propertyLossCounts[propertyId] || 0;
      const conversionBoost = ALPHA * conversionCount;
      const lossPenalty = BETA * lossCount;
      const finalScore = baseScore + conversionBoost - lossPenalty;

      return {
        id: payload.id,
        title: payload.title,
        description: payload.description,
        area: payload.area,
        bedrooms: payload.bedrooms,
        price: payload.price,
        currency: payload.currency || "AED",
        images: payload.images || [],
        _rerank_score: finalScore,
        _conversion_count: conversionCount,
        _base_score: baseScore
      };
    });

    // Sort by final re-ranked score (descending)
    rerankedProperties.sort((a, b) => (b._rerank_score || 0) - (a._rerank_score || 0));

    // Remove internal scoring fields before returning
    const cleanedProperties = rerankedProperties.map(({ _rerank_score, _conversion_count, _base_score, ...rest }) => rest);

    if (similarLeads.length > 0 && rerankedProperties.length > 0) {
      console.log(`✅ Re-ranked ${cleanedProperties.length} properties using ${similarLeads.length} similar leads`);
    }

    return cleanedProperties;
  } catch (err) {
    console.error("searchAndRerankPropertiesForLead error:", err);
    return [];
  }
}

// --- Property retrieval helper (backward compatible wrapper) ---
async function getRecommendedProperties(analysis, text) {
  // Generate embedding for the lead
  const parts = [];
  parts.push("Dubai");
  if (analysis.area && analysis.area !== "Unknown" && analysis.area !== "unknown") {
    parts.push(analysis.area);
  }
  if (analysis.intent) {
    parts.push(analysis.intent === "rent" ? "rental" : "for sale");
  }
  if (text) {
    parts.push(text.substring(0, 150).trim());
  }
  const queryText = parts.length > 0 ? parts.join(". ") : "Dubai property apartment villa";
  const leadEmbedding = await embedText(queryText);

  // Use the new adaptive ranking function
  return await searchAndRerankPropertiesForLead(leadEmbedding, analysis, text);
}

// --- Express middleware & routes ---
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "KeySync Lite backend is running" });
});

// Diagnostic endpoint to inspect Qdrant collections / counts
app.get("/api/debug/qdrant", async (req, res) => {
  try {
    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      return res.json({
        error: "QDRANT env vars not set",
        QDRANT_URL: process.env.QDRANT_URL ? "Set" : "Not set",
        QDRANT_API_KEY: process.env.QDRANT_API_KEY ? "Set" : "Not set"
      });
    }

    const collections = await qdrantClient.getCollections();
    const collectionNames = collections.collections.map((c) => c.name);

    const responsePayload = {
      status: "ok",
      collections: collectionNames,
      knowledge: { exists: false, count: 0 },
      properties: { exists: false, count: 0 }
    };

    if (collectionNames.includes("keysync_knowledge")) {
      responsePayload.knowledge.exists = true;
      try {
        const info = await qdrantClient.getCollection("keysync_knowledge");
        responsePayload.knowledge.count = info.points_count || 0;
      } catch (err) {
        responsePayload.knowledge.error = err.message;
      }
    }

    if (collectionNames.includes("properties")) {
      responsePayload.properties.exists = true;
      try {
        const info = await qdrantClient.getCollection("properties");
        responsePayload.properties.count = info.points_count || 0;
      } catch (err) {
        responsePayload.properties.error = err.message;
      }
    }

    return res.json(responsePayload);
  } catch (err) {
    console.error("Qdrant debug endpoint error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Simple Gemini test route ---
app.get("/api/test-gemini", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

    const prompt =
      'Reply with only this JSON and nothing else: { "message": "ok" }';

    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text().trim();

    console.log("Gemini test raw output:", rawText);

    // Try to parse JSON from Gemini response
    let data;
    try {
      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}");
      const jsonString = rawText.slice(start, end + 1);
      data = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Failed to parse Gemini test JSON:", parseErr);
      data = { message: "ok (could not parse JSON cleanly)" };
    }

    res.json({
      success: true,
      from: "Gemini test route",
      raw: rawText,
      parsed: data
    });
  } catch (err) {
    console.error("Gemini test route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/lead", async (req, res) => {
  try {
    const { channel, text, isFirstMessage } = req.body || {};
    // Default to true if not provided (assume first message)
    const isFirst = isFirstMessage !== undefined ? isFirstMessage : true;

    console.log("Received lead:", { channel, text, isFirstMessage: isFirst });

    // 1) AI analysis with safe Gemini wrapper
    const analysis = await analyzeLeadGemini(text);
    console.log("Final analysis used:", analysis);

    // Generate embedding for adaptive learning (used for persona selection and property ranking)
    const leadEmbedding = await embedText(text || "");

    // 2) Choose persona with adaptive learning from lead_memory
    const personaResult = await choosePersonaWithMemory(analysis, text, leadEmbedding);
    const persona = personaResult.persona;
    const personaMetadata = personaResult.decision_metadata;

    // Safety: if for some reason persona is missing, default to Omar
    const safePersona = persona || PERSONAS.find((p) => p.id === "omar");

    const score = analysis.lead_score ?? 0;
    const isHighPriority =
      analysis.priority === "high" || score >= 8;

    let reply;
    let handling_mode;
    let needs_human;
    let qdrantContext = [];
    let recommendedProperties = [];

    // Only get recommended properties if user explicitly asks for them
    const shouldShowProperties = isRequestingProperties(text);
    
    // Find similar leads for UI display (regardless of property request)
    let similarLeads = [];
    try {
      similarLeads = await findSimilarLeads(leadEmbedding, DEFAULT_FIRM_ID, 3);
    } catch (err) {
      console.error("Error finding similar leads (non-critical):", err);
    }

    if (shouldShowProperties) {
      console.log("User is requesting properties/listings - fetching recommendations");
      try {
        // Use adaptive property search with outcome-aware re-ranking
        recommendedProperties = await searchAndRerankPropertiesForLead(leadEmbedding, analysis, text);
        console.log("Recommended properties:", recommendedProperties.length);
      } catch (err) {
        console.error("Error getting recommended properties:", err);
        // Continue without properties - not a critical failure
      }
    } else {
      console.log("User query does not request properties - skipping property retrieval");
    }

    if (isHighPriority) {
      // High-value lead → escalate to human
      handling_mode = "human";
      needs_human = true;

      reply =
        "This looks like an important enquiry. I'm connecting you directly with our senior advisor so they can assist you personally with the next steps.";
    } else {
      // Normal lead → AI handles reply with Qdrant context
      handling_mode = "ai";
      needs_human = false;

      // 3a) Get knowledge from Qdrant (Dubai area + persona style etc.)
      qdrantContext = await getKnowledgeForLead(analysis, safePersona);

      // 3b) Generate grounded AI reply using Gemini + Qdrant + Properties
      reply = await generateReplyAI(analysis, safePersona, qdrantContext, recommendedProperties, shouldShowProperties, isFirst);
    }

    // Attach context into analysis for debugging / UI
    analysis.qdrant_context = qdrantContext;
    analysis.recommendedProperties = recommendedProperties;

    // Write lead to memory for future adaptive learning (non-blocking)
    writeLeadToMemory({
      text,
      channel: channel || "unknown",
      analysis,
      persona: safePersona,
      recommendedProperties
    }).catch(err => {
      // Already handled in writeLeadToMemory, but catch here to be safe
      console.error("Lead memory write failed:", err);
    });

    // 4) Knowledge section for quick summary
    const knowledge = [
      "Lead was analyzed using Google Gemini (AI) with fallback to rule-based analysis if needed.",
      `Detected intent: ${analysis.intent}`,
      `Detected area: ${analysis.area}`,
      `Detected timeframe: ${analysis.timeframe}`,
      `Detected client type: ${analysis.client_type}`,
      `Lead score: ${analysis.lead_score}`,
      `Priority: ${analysis.priority}`,
      `Handling mode: ${handling_mode}`,
      `Qdrant snippets used: ${qdrantContext.length}`,
      `Similar leads found: ${similarLeads.length}`
    ];

    return res.json({
      analysis,
      persona: safePersona,
      knowledge,
      reply,
      handling_mode,
      needs_human,
      recommendedProperties,
      // Add adaptive learning data for UI
      similar_leads: similarLeads,
      persona_metadata: personaMetadata
    });
  } catch (err) {
    console.error("Error in /api/lead:", err);
    return res
      .status(500)
      .json({ error: "Internal error in /api/lead", details: err.message });
  }
});

// --- Start server ---
// Export app for Vercel serverless functions
module.exports = app;

// Only listen if running locally (not on Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`KeySync Lite server running on http://localhost:${PORT}`);
    // Init Qdrant collections in background
    ensureKnowledgeCollection();
    ensureLeadMemoryCollection();
  });
}

