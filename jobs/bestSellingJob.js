const inventoryManager = require("../utils/inventoryManager");

/**
 * Periodic job to check and demote best-selling dishes and products after 24 hours
 * Should be called every hour or as needed
 */
exports.checkBestSellingExpiration = async () => {
  try {
    console.log("[restaurant] Running best-selling expiration check...");
    
    // Check dishes
    const dishResult = await inventoryManager.checkBestSellingExpiration();
    console.log("[restaurant] Dishes best-selling check completed. Demoted:", dishResult.modifiedCount);
    
    // Check products
    const productResult = await inventoryManager.checkProductBestSellingExpiration();
    console.log("[restaurant] Products best-selling check completed. Demoted:", productResult.modifiedCount);
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
