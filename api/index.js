// Vercel serverless function wrapper for Express app
// This file is used by Vercel to handle /api/* routes
const app = require('../server');

// Export the Express app for Vercel
module.exports = app;

