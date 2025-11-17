require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL_NAME = "text-embedding-004";
const QDRANT_VECTOR_DIM = 768;
const PROPERTIES_COLLECTION = "properties";

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

async function embedText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error("embedText error:", err);
    throw err;
  }
}

async function ensurePropertiesCollection() {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    console.warn("Qdrant env vars not set, skipping collection init");
    return false;
  }

  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === PROPERTIES_COLLECTION
    );

    if (!exists) {
      console.log("Creating Qdrant collection:", PROPERTIES_COLLECTION);
      await qdrantClient.createCollection(PROPERTIES_COLLECTION, {
        vectors: {
          size: QDRANT_VECTOR_DIM,
          distance: "Cosine"
        }
      });
      console.log("Qdrant collection created");
    } else {
      console.log("Qdrant collection already exists");
    }
    return true;
  } catch (err) {
    console.error("Error ensuring Qdrant collection:", err);
    return false;
  }
}

async function seedProperties() {
  try {
    // Check if Qdrant is configured
    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      console.warn("⚠️  Qdrant env vars not set. Skipping property seeding.");
      console.log("Properties will be available once Qdrant is configured.");
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️  GEMINI_API_KEY not set. Cannot generate embeddings.");
      return;
    }

    const canSeed = await ensurePropertiesCollection();
    if (!canSeed) {
      return;
    }

    // Load properties
    const propertiesPath = path.join(__dirname, "..", "data", "properties.json");
    const propertiesData = fs.readFileSync(propertiesPath, "utf8");
    const properties = JSON.parse(propertiesData);

    console.log(`\n📦 Seeding ${properties.length} properties to Qdrant...\n`);

    const points = [];

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      // Build text for embedding
      const textForEmbedding = `${property.title}. ${property.description}. Area: ${property.area}. ${property.bedrooms} bedrooms. Price: ${property.price} ${property.currency}.`;

      let vector;
      try {
        vector = await embedText(textForEmbedding);
        console.log(`✓ Embedded property ${i + 1}/${properties.length}: ${property.title}`);
      } catch (err) {
        console.warn(`⚠️  Falling back to dummy vector for ${property.id}`);
        vector = Array(QDRANT_VECTOR_DIM).fill(0);
      }

      points.push({
        id: i + 1,
        vector,
        payload: {
          id: property.id,
          title: property.title,
          description: property.description,
          area: property.area,
          bedrooms: property.bedrooms,
          price: property.price,
          currency: property.currency,
          images: property.images
        }
      });
    }

    await qdrantClient.upsert(PROPERTIES_COLLECTION, { points });

    console.log(`\n✅ Successfully seeded ${properties.length} properties to Qdrant!\n`);
  } catch (err) {
    console.error("Error seeding properties:", err);
    process.exit(1);
  }
}

seedProperties();

