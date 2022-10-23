const Comment = require("../Models/commentModel");
const Article = require("../Models/articleModel");

const addComment = async (req, res) => {
  try {
    const { articleId, ...comment } = req.body;
    comment.user = req.user._id;
    const commenttosave = new Comment(comment);
    const savedcomment = await commenttosave.save();
    await Article.findOneAndUpdate(
      { _id: articleId },
      { $push: { comment: savedcomment._id } }
    );
    res.status(200).send({
      status: "success",
      message: "Comment has been created",
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getbyPostId = async (req, res) => {
  const ArticleId = req.params.ArticleId;
  try {
    const article = await Article.findOne({ _id: ArticleId }).populate(
      "comment"
    );
    res.status(200).send({
      status: "success",
      comments: article.comment,
    });
  } catch (error) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

module.exports = { addComment, getbyPostId };
