const Router = require("express");
const router = new Router();
const controller = require("../controllers/authController");
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post(
  "/registration",
  [
    check("nickname", "Username cannot be empty").notEmpty(),
    check("email", "Email cannot be empty").isEmail(),
    check(
      "password",
      "Password must be more than 1 and less than 32 characters"
    ).isLength({ min: 1, max: 32 }),
    check("avatarUrl").optional().isString(),
  ],
  controller.registration
);
router.post(
  "/login",
  [
    check("email", "Email cannot be empty").isEmail(),
    check(
      "password",
      "Password must be more than 1 and less than 32 characters"
    ).isLength({ min: 1, max: 32 }),
  ],
  controller.login
);
router.get("/getMe", authMiddleware, controller.getMe);
router.get("/users", roleMiddleware("ADMIN"), controller.getUsers);

module.exports = router;
