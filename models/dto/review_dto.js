export default class ReviewDTO {
    constructor(review, _id_user_requesting) {
        // Data

        console.log("\n -- REVIEW EN CLASE: ", review);
        this._id_review = review._id_review;
        this.content = review.content;
        this.rating = review.rating;
        this.is_valid = review.is_valid;
        this.createdAt = review.createdAt;
        this.updatedAt = review.updatedAt;
        this._id_business = review._id_business;
        this._id_user = review._id_user;

        // MetaData
        this.commentsCount = 0;
        this.likesCount = 0;
        this.is_liked = false;
        this.Comment = {
            _id_comment: null,
            content: null,
            createdAt: null,
            updatedAt: null,
            is_liked: null,
            User: {
                _id_user: null,
                name: null,
                last_name: null,
                nick_name: null,
            },
        };

        this.User = {
            _id_user: review.User?.hasOwnProperty("_id_user")
                ? review.User._id_user
                : _id_user_requesting,
            name: review.User?.name || null,
            last_name: review.User?.last_name || null,
            nick_name: review.User?.nick_name || null,
            is_followed: false,
        };

        this.Business = {
            _id_business: review.Business?.hasOwnProperty("_id_business")
                ? review.Business._id_business
                : null,
            name: review.Business?.name || null,
            entity: review.Business?.entity || null,
            is_followed: false,
        };
    }

    setMetaData(
        commentMetaData,
        likeMetaData,
        userFollowings,
        businessFollowings
    ) {
        this.commentsCount = commentMetaData.comments.length;
        this.likesCount = parseInt(likeMetaData?.dataValues?.likeCount) || 0;
        this.is_liked = likeMetaData?.dataValues?.userLiked === "1";

        const targetUserId = this._id_user;
        this.User.is_followed = userFollowings.some(
            (userFollowing) =>
                userFollowing.dataValues._id_followed === targetUserId
        );

        const targetBusinessId = this._id_business;
        this.Business.is_followed = businessFollowings.some(
            (businessFollowing) =>
                businessFollowing.dataValues._id_business === targetBusinessId
        );
    }

    setUserName(user) {
        this.User.name = user.name;
        this.User.last_name = user.last_name;
        this.User.nick_name = user.nick_name;
    }

    setBusiness(businessFollowings) {
        const targetBusinessId = this._id_business;
        this.Business.is_followed = businessFollowings.some(
            (businessFollowing) =>
                businessFollowing.dataValues._id_business === targetBusinessId
        );
    }

    getReviewData() {
        return {
            _id_review: this._id_review,
            content: this.content,
            rating: this.rating,
            likesCount: this.likesCount,
            commentsCount: this.commentsCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            is_liked: this.is_liked,
            is_valid: this.is_valid,
            User: {
                _id_user: this.User._id_user,
                name: this.User.name,
                last_name: this.User.last_name,
                nick_name: this.User.nick_name,
                is_followed: this.User.is_followed,
            },
            Business: {
                _id_business: this.Business._id_business,
                name: this.Business.name,
                entity: this.Business.entity,
                is_followed: this.Business.is_followed,
            },
        };
    }
}
