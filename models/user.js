const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 8 },
  links: [{ type: mongoose.Types.ObjectId, required: true, ref: "Link" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
