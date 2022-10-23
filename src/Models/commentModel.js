const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String, max: 500 },
});

module.exports = mongoose.model("Comment", CommentSchema);
