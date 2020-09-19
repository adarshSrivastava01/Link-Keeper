const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ message: "link route" });
});

module.exports = router;