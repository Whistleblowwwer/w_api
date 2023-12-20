export class InteractionsDTO {
    constructor() {
        this.comments = [];
        this.likes = [];
    }

    setComments(comments) {
        this.comments = comments;
    }

    setLikes(likes) {
        this.likes = likes;
    }

    getDTO() {
        return {
            comments: this.comments,
            likes: this.likes,
        };
    }
}
