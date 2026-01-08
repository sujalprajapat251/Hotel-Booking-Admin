const express = require("express");
const router = express.Router();
const { generateCsrfToken } = require("../middleware/csrfProtection");

router.get("/csrf-token", (req, res) => {
  try {
    const token = generateCsrfToken(req, res); 
    console.log("_________________________",token);
    
    if (!token) {
      return res.status(500).json({ message: "Failed to generate CSRF token" });
    }
    
    res.json({ csrfToken: token });
  } catch (err) {
    console.error("CSRF Token Generation Error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
});

module.exports = router;