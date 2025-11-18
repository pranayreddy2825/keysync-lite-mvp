// Add a diagnostic endpoint to check Qdrant collections
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
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});
