// middleware/guestLimiter.js

// Temporary in-memory store for guest usage counts
// Structure: { guestId: { count: number, firstUsed: timestamp } }
// Consider using Redis or a database for persistence in production.
const guestUsage = {};
const GUEST_LIMIT = 3; // Max requests per guest session
const GUEST_WINDOW_MS = 30 * 60 * 1000; // 30 minutes window

const guestLimiter = (req, res, next) => {
  // Check if user is authenticated and is a guest
  // Assumes 'auth' middleware runs first and attaches req.user
  if (!req.user || req.user.role !== 'guest') {
    return next(); // Not a guest or not authenticated, skip limiter
  }

  const guestId = req.user.id; // Use the guest user ID from the token
  const now = Date.now();

  // Initialize or reset guest usage if window expired
  if (!guestUsage[guestId] || (now - guestUsage[guestId].firstUsed > GUEST_WINDOW_MS)) {
    guestUsage[guestId] = { count: 0, firstUsed: now };
    console.log(`Guest limiter: Initialized/Reset usage for guest ${guestId}`);
  }

  // Increment usage count for this request
  guestUsage[guestId].count++;
  console.log(`Guest limiter: Guest ${guestId} used ${guestUsage[guestId].count}/${GUEST_LIMIT} requests.`);

  // Check if limit is exceeded
  if (guestUsage[guestId].count > GUEST_LIMIT) {
    console.warn(`Guest limiter: Guest ${guestId} exceeded limit.`);
    return res.status(429).json({ // 429 Too Many Requests
      msg: `Guest usage limit of ${GUEST_LIMIT} requests reached. Please register or log in for full access.`,
      limitReached: true // Add a flag for frontend handling
    });
  }

  // If limit is not reached, allow the request to proceed
  next();

  // Optional: Clean up very old entries periodically (can be done elsewhere too)
  // This simple cleanup runs on every guest request, which isn't ideal for performance.
  // A better approach would be a separate interval timer.
  for (const id in guestUsage) {
    if (now - guestUsage[id].firstUsed > GUEST_WINDOW_MS * 2) { // Clean up entries older than 1 hour
      delete guestUsage[id];
    }
  }
};

module.exports = guestLimiter;