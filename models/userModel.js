const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    nickname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatarUrl: String,
    role: { type: String, ref: "Role" },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", UserSchema);
