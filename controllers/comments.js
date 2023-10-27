import { Comment } from "../models/comments.js";

//Create Comment
export const createComment = async (req, res) => {
  try {
    
    const { content, 
            _id_review,
            _id_parent 
          } = req.body;

    const _id_user = req.user._id_user;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (!_id_review) {
      return res.status(400).json({ message: "Review ID is required" });
    }

    const createdComment = await Comment.create({
      content,
      _id_review,
      _id_user,
      _id_parent: _id_parent || null, 
    });

    return res.status(201).json({
      message: "Comment created successfully",
      comment: createdComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
