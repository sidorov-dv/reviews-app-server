const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewName: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: [String],
      default: [],
    },
    authorRating: {
      type: Number,
      default: 0,
    },
    subjectRating: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ "$**": "text" });

module.exports = model("Review", ReviewSchema);
