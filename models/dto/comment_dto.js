export default class CommentDTO {
    constructor(comment, _id_user_requesting) {
        // Data
        this._id_comment = comment._id_comment;
        this.content = comment.content;
        this.is_valid = comment.is_valid;
        this.createdAt = comment.createdAt;
        this.updatedAt = comment.updatedAt;
        this._id_review = comment._id_review;
        this._id_parent = comment._id_parent;

        // MetaData
        this.likesCount = 0;
        this.commentsCount = 0; 
        this.is_liked = false;

        this.User = {
            _id_user: comment.User._id_user,
            name: comment.User.name,
            last_name: comment.User.last_name,
            nick_name: comment.User.nick_name,
            is_followed: false,
        };

        this.Images = [];
    }

    setMetaData(likesMetaData, repliesMetaData, userFollowingsSet) {
        
        const likeData = likesMetaData ? likesMetaData[this._id_comment] : null;
        const replyData = repliesMetaData ? repliesMetaData[this._id_comment] : null;

        this.likesCount = likeData ? parseInt(likeData.likeCount) || 0 : 0;
        this.commentsCount = replyData ? parseInt(replyData.repliesCount) || 0 : 0;
        this.is_liked = likeData ? likeData.userLiked === "1" : false;

        const targetUserId = this.User._id_user;
        this.User.is_followed = userFollowingsSet.has(targetUserId);
    }

    setImages(Image) {
        this.Images = Image;
    }

    getCommentData() {
        return {
            _id_comment: this._id_comment,
            content: this.content,
            is_valid: this.is_valid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            _id_review: this._id_review,
            _id_parent: this._id_parent,
            likesCount: this.likesCount,
            commentsCount: this.commentsCount, 
            is_liked: this.is_liked,
            User: this.User,
            Images: this.Images,
        };
    }
}
