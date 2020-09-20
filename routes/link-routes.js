const express = require("express");
const { check } = require("express-validator");

const linksControllers = require("../controllers/links-controllers");
const checkAuth = require("../middleware/auth-middleware");

const router = express.Router();

router.use(checkAuth);

router.get("/user/:uid", linksControllers.getLinksByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("originalUrl").isLength({ min: 5 }),
    check("category").not().isEmpty(),
  ],
  linksControllers.createLink
);

router.patch(
  "/:lid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("originalUrl").isLength({ min: 5 }),
  ],
  linksControllers.updateLink
);

router.delete("/:lid", linksControllers.deleteLink);

module.exports = router;
