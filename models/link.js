const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const linkSchema = new Schema({
  title: { type: String, required: true, minLength: 3 },
  description: { type: String, required: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  category: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Link", linkSchema);
