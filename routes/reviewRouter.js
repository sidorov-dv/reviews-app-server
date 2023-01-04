const Router = require("express");
const router = new Router();
const controller = require("../controllers/reviewController");
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware,
  [
    check("reviewName", "Enter title review").isLength({ min: 1 }).isString(),
    check("subjectName", "Enter subject name").isLength({ min: 1 }).isString(),
    check("text", "Enter review text").isLength({ min: 3 }).isString(),
  ],
  controller.create
);

router.get("/sorting/:type", controller.getAll);
router.get("/tags", controller.getTags);
router.get("/tags/:name", controller.getReviewsByTags);
router.get("/userReviews/:id", controller.getUserReviews);
router.get("/sortUserReviews/:id/", controller.getSortingUserReviews);
router.get(
  "/sortUserReviewsByTags/:id/",
  controller.getSortingUserReviewsByTags
);
router.get("/text/", controller.getSearchResult);
router.get("/:id", controller.getOne);

router.delete("/:id", authMiddleware, controller.remove);

router.patch("/rating/:id", authMiddleware, controller.updateRating);
router.patch("/likes/:id", authMiddleware, controller.updateLikes);
router.patch("/comments/:id", authMiddleware, controller.updateComments);
router.patch(
  "/:id",
  authMiddleware,
  [
    check("reviewName", "Enter title review").isLength({ min: 1 }).isString(),
    check("subjectName", "Enter subject name").isLength({ min: 1 }).isString(),
    check("text", "Enter review text").isLength({ min: 3 }).isString(),
  ],
  controller.update
);

module.exports = router;
