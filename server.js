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
const QDRANT_VECTOR_DIM = 768;

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

// --- Choose persona based on naive analysis ---
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

// --- Basic reply generator (template style, no AI yet) ---
function generateBasicReply(analysis, persona) {
  const { intent, area, timeframe } = analysis;
  const intentText = intent === "rent" ? "a rental" : "a property to buy";

  let opener = `Thanks for reaching out!`;
  if (area && area !== "Unknown") {
    opener += ` ${area} is a solid choice if you're looking for ${intentText}.`;
  }

  let personaLine = ` I'll connect you with ${persona.name}, our ${persona.specialty.toLowerCase()}.`;

  let followUpQuestion = "";
  if (intent === "rent") {
    followUpQuestion =
      " Do you prefer furnished or unfurnished, and when exactly are you planning to move?";
  } else {
    followUpQuestion =
      " Are you planning to live in the property yourself, or are you mainly looking at it as an investment?";
  }

  let timeframeLine = "";
  if (timeframe && timeframe !== "unspecified") {
    timeframeLine = ` Since you're looking around ${timeframe}, we can shortlist the best options and viewing times for you.`;
  }

  return `${opener}${personaLine}${timeframeLine}${followUpQuestion}`;
}

// --- AI reply generator using Gemini + Qdrant context + Properties ---
async function generateReplyAI(analysis, persona, qdrantSnippets, recommendedProperties = [], userRequestedProperties = false) {
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
        propertiesText = "(User asked for properties but none matched their criteria - apologize and offer to help find alternatives)";
      }
    } else {
      propertiesText = "(User did NOT request properties - do NOT mention any properties in your reply. Keep it conversational and helpful.)";
    }

    const prompt = `
You are ${persona.name}, a ${persona.specialty} at a Dubai real estate brokerage.

You are replying over WhatsApp/email to a potential client.
Write a short, clear, professional reply with 4–7 sentences.

Constraints:
- Use only the information provided in the analysis JSON, knowledge snippets, and recommended properties.
- Do NOT invent specific prices, yields, or legal details beyond what is given.
- If you are not sure about something, say you'll confirm details instead of guessing.
- Keep the tone aligned with this persona: ${persona.description}
- Focus on being helpful, asking 1–2 smart follow-up questions, and inviting the client to continue.
- IMPORTANT: Only mention or show properties if the user explicitly asked for them (photos, listings, options, etc.).
- If the user did NOT ask for properties, keep your reply conversational and helpful without mentioning specific properties.
- If properties are available AND the user asked for them, naturally mention them in your reply (e.g., "I have a few options in ${analysis.area || 'that area'} that might interest you...").
- Do NOT paste image URLs or property IDs. Just refer to properties naturally in your text.

Lead analysis (JSON):
${JSON.stringify(analysis, null, 2)}

Knowledge snippets (may be 0 or more, use only if relevant):
${knowledgeText || "(no extra snippets)"}

Recommended properties (may be 0 or more):
${propertiesText}

Write your reply in first person as ${persona.name}.
Only output the message text the client should see, no explanations or JSON.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    return text;
  } catch (err) {
    console.error("generateReplyAI error, falling back to basic reply:", err);
    // Fallback: use the template reply so we never crash
    return generateBasicReply(analysis, persona);
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
function isRequestingProperties(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase().trim();
  
  // Keywords that indicate user wants to see properties/listings/photos
  const propertyRequestKeywords = [
    'photo', 'photos', 'picture', 'pictures', 'image', 'images',
    'show me', 'show', 'send me', 'send', 'share',
    'listing', 'listings', 'property', 'properties',
    'option', 'options', 'available', 'availability',
    'see', 'view', 'look at', 'can i see', 'would like to see',
    'interested in seeing', 'want to see', 'like to see',
    'details', 'more information', 'more info', 'tell me more',
    'what do you have', 'what properties', 'what options',
    'any properties', 'any options', 'any listings',
    'have available', 'have', 'got', 'got any'
  ];
  
  // Check if any keyword is present in the text
  const hasKeyword = propertyRequestKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  // Also check for question patterns that might request properties
  const questionPatterns = [
    /\b(what|which|where|how many)\s+(properties|listings|options|apartments|villas|houses)/i,
    /\b(can|could|would)\s+(you|i)\s+(show|see|send|share)/i,
    /\b(do you have|are there|is there)\s+(any|some)/i,
    /show\s+me\s+(the\s+)?(listing|listings|images|photos|properties|options)/i,
    /(can|could|would)\s+you\s+show\s+(me\s+)?(some|any|the)/i
  ];
  
  const hasQuestionPattern = questionPatterns.some(pattern => pattern.test(text));
  
  // Additional check: if text contains "image" or "listing" with "show" or "see"
  const hasImageListingRequest = /(show|see|send|share).*?(image|listing|photo|property)/i.test(text) ||
                                  /(image|listing|photo|property).*?(show|see|send|share)/i.test(text);
  
  return hasKeyword || hasQuestionPattern || hasImageListingRequest;
}

// --- Property retrieval helper ---
async function getRecommendedProperties(analysis, text) {
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

    // Embed query text
    const queryVector = await embedText(queryText);

    // First, check if properties collection exists
    try {
      const collections = await qdrantClient.getCollections();
      const hasPropertiesCollection = collections.collections.some(c => c.name === "properties");
      
      if (!hasPropertiesCollection) {
        console.error("❌ Properties collection does not exist in Qdrant!");
        console.log("Available collections:", collections.collections.map(c => c.name));
        return [];
      }
    } catch (err) {
      console.error("Error checking collections:", err);
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
      console.log("✅ Top match score:", searchResult[0].score);
    } else {
      console.warn("⚠️ No properties found - collection might be empty or query doesn't match");
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

    // Map to Property format
    const properties = (searchResult || []).map((pt) => {
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
  } catch (err) {
    console.error("getRecommendedProperties error:", err);
    return [];
  }
}

// --- Express middleware & routes ---
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "KeySync Lite backend is running" });
});

// Diagnostic endpoint to check Qdrant collections
app.get("/api/debug/qdrant", async (req, res) => {
  try {
    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      return res.json({ 
        error: "Qdrant env vars not set",
        QDRANT_URL: process.env.QDRANT_URL ? "Set" : "Not set",
        QDRANT_API_KEY: process.env.QDRANT_API_KEY ? "Set" : "Not set"
      });
    }

    const collections = await qdrantClient.getCollections();
    const collectionNames = collections.collections.map(c => c.name);
    
    // Check if properties collection exists and has data
    let propertiesCount = 0;
    let knowledgeCount = 0;
    
    if (collectionNames.includes("properties")) {
      try {
        const propsInfo = await qdrantClient.getCollection("properties");
        propertiesCount = propsInfo.points_count || 0;
      } catch (err) {
        console.error("Error getting properties collection:", err);
      }
    }
    
    if (collectionNames.includes("keysync_knowledge")) {
      try {
        const knowledgeInfo = await qdrantClient.getCollection("keysync_knowledge");
        knowledgeCount = knowledgeInfo.points_count || 0;
      } catch (err) {
        console.error("Error getting knowledge collection:", err);
      }
    }

    return res.json({
      status: "ok",
      collections: collectionNames,
      properties: {
        exists: collectionNames.includes("properties"),
        count: propertiesCount
      },
      knowledge: {
        exists: collectionNames.includes("keysync_knowledge"),
        count: knowledgeCount
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      error: "Qdrant check failed", 
      details: err.message
    });
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
    const { channel, text } = req.body || {};

    console.log("Received lead:", { channel, text });

    // 1) AI analysis with safe Gemini wrapper
    const analysis = await analyzeLeadGemini(text);
    console.log("Final analysis used:", analysis);

    // 2) Choose persona based on analysis + text
    const persona = choosePersona(analysis, text);

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
    
    if (shouldShowProperties) {
      console.log("User is requesting properties/listings - fetching recommendations");
      try {
        recommendedProperties = await getRecommendedProperties(analysis, text);
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
      reply = await generateReplyAI(analysis, safePersona, qdrantContext, recommendedProperties, shouldShowProperties);
    }

    // Attach context into analysis for debugging / UI
    analysis.qdrant_context = qdrantContext;
    analysis.recommendedProperties = recommendedProperties;

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
      `Qdrant snippets used: ${qdrantContext.length}`
    ];

    return res.json({
      analysis,
      persona: safePersona,
      knowledge,
      reply,
      handling_mode,
      needs_human,
      recommendedProperties
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
    // Init Qdrant collection in background
    ensureKnowledgeCollection();
  });
}

