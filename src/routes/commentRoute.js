const router = require("express").Router();
const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

router.post("/", authController.verify, commentController.addComment);
router.get("/:ArticleId", commentController.getbyPostId);

module.exports = router;
