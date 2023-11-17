import { Comment } from "../models/comments.js";

// Get Comment Children 
export const getCommentChildren = async (req, res) => {
  const _id_comment = req.query._id_comment;

  if (!_id_comment) {
    return res.status(400).json({ message: "Comment ID is required" });
  }

  try {
    const commentChildren = await Comment.findAll({
      where: { _id_parent: _id_comment }
    });

    if (commentChildren.length === 0) {
      return res.status(404).json({ message: "Comments not found" });
    }

    res.status(200).json({ 
      message: "Comments retrieved successfully",
      comments: commentChildren
    });
  } catch (error) {
    console.error("Error finding comments:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: error.errors.map(err => err.message) 
      });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

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

// Update Comment
export const updateComment = async (req, res) => {
  const _id_comment  = req.query._id_comment;
  const { content } = req.body;
  const _id_user = req.user._id_user; 

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const commentToUpdate = await Comment.findOne({
      where: { _id_comment }
    });

    if (!commentToUpdate) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentToUpdate._id_user !== _id_user) {
      return res.status(403).json({ message: "You do not have permission to edit this comment" });
    }

    commentToUpdate.content = content;
    await commentToUpdate.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment: commentToUpdate
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: error.errors.map(err => err.message) 
      });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

// Deactivate Comment
export const deactivateComment = async (req, res) => {
  const _id_comment  = req.query._id_comment ;
  const _id_user = req.user._id_user;

  try {
    const commentToDeactivate = await Comment.findOne({
      where: { _id_comment }
    });

    if (!commentToDeactivate) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentToDeactivate._id_user !== _id_user) {
      return res.status(403).json({ message: "You do not have permission to deactivate this comment" });
    }

    commentToDeactivate.is_valid = false;
    await commentToDeactivate.save();

    return res.status(200).json({
      message: "Comment deactivated successfully",
      deactivated: true
    });
  } catch (error) {
    console.error("Error deactivating comment:", error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: error.errors.map(err => err.message) 
      });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
