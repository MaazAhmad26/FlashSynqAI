const functions = require("firebase-functions");
const { app } = require("./server.cjs");

// Expose our Express server as a single Firebase Cloud Function
exports.api = functions.https.onRequest(app);
