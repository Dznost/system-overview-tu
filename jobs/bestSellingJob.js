const inventoryManager = require("../utils/inventoryManager");

/**
 * Periodic job to check and demote best-selling dishes after 24 hours
 * Should be called every hour or as needed
 */
exports.checkBestSellingExpiration = async () => {
  try {
    console.log("[restaurant] Running best-selling expiration check...");
    const result = await inventoryManager.checkBestSellingExpiration();
    console.log("[restaurant] Best-selling check completed. Demoted:", result.modifiedCount);
  } catch (error) {
    console.error("[restaurant] Error in best-selling job:", error);
  }
};

/**
 * Initialize cron jobs
 * This function should be called when the server starts
 */
exports.initializeJobs = () => {
  try {
    // Run best-selling check every hour
    const HOUR_IN_MS = 60 * 60 * 1000;
    setInterval(() => {
      exports.checkBestSellingExpiration();
    }, HOUR_IN_MS);

    console.log("[restaurant] Background jobs initialized");
  } catch (error) {
    console.error("[restaurant] Error initializing jobs:", error);
  }
};

/**
 * Run best-selling check immediately (useful for testing/manual trigger)
 */
exports.runNow = async () => {
  return await exports.checkBestSellingExpiration();
};
