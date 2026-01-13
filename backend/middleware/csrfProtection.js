const { doubleCsrf } = require("csrf-csrf");
const { v4: uuidv4 } = require("uuid");

const CSRF_COOKIE_NAME = process.env.NODE_ENV === "production" ? "__Host-csrf" : "csrf";
const CSRF_SESSION_COOKIE_NAME = process.env.NODE_ENV === "production" ? "__Host-csrf-session" : "csrf-session";
const MAX_AGE = 10 * 60 * 1000;

const {
  invalidCsrfTokenError,
  generateCsrfToken, 
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "super-secret",
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  },
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  getTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] ||
    req.headers["csrf-token"] ||
    req.headers["X-CSRF-Token"],
  getSessionIdentifier: (req) => {
    let sessionId = req.cookies[CSRF_SESSION_COOKIE_NAME];

    if (!sessionId) {
      sessionId = uuidv4();
      req.newSessionId = sessionId;
    }

    return sessionId;
  },
  size: 64,
});

// Wrapper to handle session cookie setting
const doubleCsrfProtectionWrapper = (req, res, next) => {
  // Set session cookie if it's new
  if (req.newSessionId) {
    res.cookie(CSRF_SESSION_COOKIE_NAME, req.newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
  }

  doubleCsrfProtection(req, res, next);
};

module.exports = {
  generateCsrfToken: (req, res) => {
    // Ensure session cookie is set before generating token
    let sessionId = req.cookies[CSRF_SESSION_COOKIE_NAME];

    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie(CSRF_SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
      });
      // Update request object so getSessionIdentifier can find it
      req.cookies[CSRF_SESSION_COOKIE_NAME] = sessionId;
    }

    // generateToken is now available from destructuring
    return generateCsrfToken(req, res);
  },
  doubleCsrfProtection: doubleCsrfProtectionWrapper,
  invalidCsrfTokenError,
};