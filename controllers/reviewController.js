const ReviewModel = require("../models/reviewModel");
const { validationResult } = require("express-validator");

class ReviewController {
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Create review errors", errors });
      }
      let {
        reviewName,
        subjectName,
        category,
        text,
        tags,
        authorRating,
        imageUrl,
        user,
      } = req.body;
      if (!user) {
        user = req.user.id;
      }
      const review = new ReviewModel({
        reviewName,
        subjectName,
        category,
        text,
        tags,
        imageUrl,
        authorRating,
        user,
      });
      await review.save();
      res.json(review);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Review create error" });
    }
  }

  async getAll(req, res) {
    try {
      const type = req.params.type;
      let reviews;
      if (type === "new") {
        reviews = await ReviewModel.find()
          .sort({ createdAt: -1 })
          .limit(30)
          .populate("user")
          .exec();
      }
      if (type === "popular") {
        reviews = await ReviewModel.find()
          .sort({ likesCount: -1 })
          .limit(30)
          .populate("user")
          .exec();
      }
      if (type === "rating") {
        reviews = await ReviewModel.find()
          .sort({ authorRating: -1 })
          .limit(30)
          .populate("user")
          .exec();
      }
      if (!reviews) {
        return res.status(404).json({ message: `Reviews not found` });
      }
      res.json(reviews);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get reviews" });
    }
  }

  async getTags(req, res) {
    try {
      const reviews = await ReviewModel.find()
        .sort({ createdAt: -1 })
        .limit(30);
      const tags = reviews.map((obj) => obj.tags).flat();
      const tagsSet = new Set(tags);
      const uniqTags = Array.from(tagsSet);
      res.json(uniqTags);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get tags" });
    }
  }

  async getReviewsByTags(req, res) {
    try {
      const name = req.params.name;
      const reviews = await ReviewModel.find({
        tags: name,
      })
        .sort({ createdAt: -1 })
        .populate("user")
        .exec();
      if (!reviews) {
        return res.status(404).json({ message: `Reviews not found` });
      }
      res.json(reviews);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get reviews" });
    }
  }

  async getUserReviews(req, res) {
    try {
      const userId = req.params.id;
      const reviews = await ReviewModel.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("user")
        .exec();
      if (!reviews) {
        return res.status(404).json({ message: `Reviews not found` });
      }
      res.json(reviews);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get reviews" });
    }
  }

  async getSortingUserReviews(req, res) {
    try {
      const userId = req.params.id;
      const sort = req.query.sort;
      let reviews;
      if (sort === "new") {
        reviews = await ReviewModel.find({
          user: userId,
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate("user")
          .exec();
      }
      if (sort === "popular") {
        reviews = await ReviewModel.find({
          user: userId,
        })
          .sort({ likesCount: -1 })
          .limit(20)
          .populate("user")
          .exec();
      }
      if (sort === "rating") {
        reviews = await ReviewModel.find({
          user: userId,
        })
          .sort({ authorRating: -1 })
          .limit(20)
          .populate("user")
          .exec();
      }
      if (!reviews) {
        return res.status(404).json({ message: `Reviews not found` });
      }
      res.json(reviews);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get reviews" });
    }
  }

  async getSortingUserReviewsByTags(req, res) {
    try {
      const userId = req.params.id;
      const tag = req.query.tag;
      const reviews = await ReviewModel.find({
        user: userId,
        tags: tag,
      })
        .sort({ createdAt: -1 })
        .populate("user")
        .exec();
      if (!reviews) {
        return res.status(404).json({ message: `Reviews not found` });
      }
      res.json(reviews);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get reviews" });
    }
  }

  async getOne(req, res) {
    try {
      const reviewId = req.params.id;
      const review = await ReviewModel.findOne({ _id: reviewId })
        .populate("user")
        .exec();
      if (!review) {
        return res.status(404).json({ message: `Review not found` });
      }
      res.json(review);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get review" });
    }
  }

  async getSearchResult(req, res) {
    try {
      const search = req.query.search;
      const reviews = await ReviewModel.find(
        { $text: { $search: search } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .populate("user")
        .exec();
      if (!reviews) {
        return res.status(404).json({ message: `Reviews not found` });
      }
      res.json(reviews);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Can't get reviews" });
    }
  }

  async remove(req, res) {
    try {
      const reviewId = req.params.id;
      const review = await ReviewModel.findOneAndDelete({
        _id: reviewId,
      }).exec();
      if (!review) {
        return res.status(404).json({ message: `Review not found` });
      }
      res.json({ message: "Review was deleted" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Delete review failed" });
    }
  }

  async updateRating(req, res) {
    try {
      const reviewId = req.params.id;
      const { userIdRating, grade } = req.body;
      const { id } = req.user;
      const reviewWithRating = await ReviewModel.findOne({
        $and: [
          { _id: reviewId },
          { "subjectRating.userIdRating": userIdRating ? userIdRating : id },
        ],
      });
      if (reviewWithRating) {
        return res.json({ message: "You already rated this review!" });
      }
      const review = await ReviewModel.findOneAndUpdate(
        { _id: reviewId },
        {
          $push: {
            subjectRating: {
              userIdRating: userIdRating ? userIdRating : id,
              grade,
            },
          },
        }
      )
        .populate("user")
        .exec();
      res.json({ message: "Update user rating successful!", review });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Update review failed" });
    }
  }

  async updateLikes(req, res) {
    try {
      const reviewId = req.params.id;
      let { like } = req.body;
      const { id } = req.user;
      if (!like) {
        like = id;
      }
      const reviewWithLikes = await ReviewModel.findOne({
        $and: [{ _id: reviewId }, { likes: like }],
      });
      if (reviewWithLikes) {
        return res.json({ message: "You already liked this review!" });
      }
      const userWhoLiked = await ReviewModel.findOneAndUpdate(
        { _id: reviewId },
        {
          $push: {
            likes: like,
          },
        }
      )
        .populate("user")
        .exec();
      const userReviews = await ReviewModel.find({
        user: userWhoLiked.user._id,
      })
        .populate("user")
        .exec();
      const likes = userReviews.map((obj) => obj.likes).flat().length;
      await ReviewModel.updateMany(
        { user: userWhoLiked.user._id },
        { $set: { likesCount: likes } }
      );
      res.json({ message: "Update user like successful!", likes });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Update review failed" });
    }
  }

  async updateComments(req, res) {
    try {
      const reviewId = req.params.id;
      const comments = req.body;
      const review = await ReviewModel.findOneAndUpdate(
        { _id: reviewId },
        {
          $push: {
            comments: comments,
          },
        }
      )
        .populate("user")
        .exec();
      res.json({ message: "Update comments successful!", review });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Update review failed" });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Update review errors", errors });
      }
      const reviewId = req.params.id;
      const {
        reviewName,
        subjectName,
        category,
        text,
        tags,
        authorRating,
        imageUrl,
      } = req.body;
      const review = await ReviewModel.findOneAndUpdate(
        { _id: reviewId },
        {
          reviewName,
          subjectName,
          category,
          text,
          tags,
          authorRating,
          imageUrl,
        }
      )
        .populate("user")
        .exec();
      res.json({ message: "Update successful", review });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Update review failed" });
    }
  }
}

module.exports = new ReviewController();
