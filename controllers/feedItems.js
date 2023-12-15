import { Sequelize } from "sequelize";
import { FeedItems_Read, FeedItems_Write } from "../models/feedItems.js";
import { UserFollowers } from "../models/userFollowers.js";
import { User } from "../models/users.js";
import { UserCache } from "../middlewares/cache.js";
import { addtoBatch } from "../middlewares/batchprocessing.js";


export const CreateFeedItem = async (req, res) => {
    try{
        const {_id_user, score, interaction, is_valid} = req.body;

        //Check if User exits
        if(!UserCache.get(_id_user)){
            return res.status(400).send({ message: "User not found"});
        }

        //Get list of Followers
        const list_id_target = await UserFollowers.findAll({
            attributes: ['_id_follower'],
            where: {_id_followed: _id_user}
        })

        const followerIds = list_id_target.map(item => item._id_follower);

        if(!followerIds){
            return res.status(400).send({ message: "User has no followers"});
        }

        
        //Create Feed Item
        addtoBatch(async () => {
            const createdFeedItem = await FeedItems_Write.create({
                _id_user,
                list_id_target: followerIds,
                score,
                interaction,
                is_valid,
            });
        });

        for (const follower in followerIds){
            addtoBatch(async () => {
                const createdFeedItem = await FeedItems_Read.create({
                    _id_user,
                    list_id_target: follower,
                    score,
                    interaction,
                    is_valid,
                });
            });
        }


        return res.status(201).json({
            message: "FeedItem created successfully",
        });

    }
    catch(error){
        return res.status(500).send({ message: "Internal Server Error", error: error });
    }
}

export const ReadFeedItem = async (req, res) => {
    try{
        const _id_feed_item = req.query._id_feed_item

        const feedItem = await FeedItems_Read.findByPk(_id_feed_item);

        if(!feedItem){
            return res.status(400).json({
                message: "FeedItem not found",
            });
        }

        return res.status(201).json({
            message: "FeedItem retrieved successfully",
            FeedItem: feedItem.dataValues
        });

    }
    catch(err){
        return res.status(500).send({ message: "Internal Server Error", error: err });
    }
}

export const UpdateFeedItem = async (req, res) => {
    try{
        const { _id_feed_item, _id_user, list_id_target, score, interaction, is_valid} = req.body;

        const feedItem = await FeedItems_Write.findByPk(_id_feed_item);

        console.log(feedItem)

        if (!feedItem) {
            return res.status(400).send({ message: "No FeedItem with that id" });
        }

        const updatedFields = {
            FeedItems_Write: {
                _id_user: _id_user,
                list_id_target: list_id_target,
                score: score,
                interaction: interaction,
                is_valid: is_valid
            },
        };

        addtoBatch(async () => {
            await FeedItemModel.update(updatedFields, {
                where: {
                    _id_feed_item: _id_feed_item,
                },
            });    
        });

        return res.status(201).json({
            message: "FeedItem updated successfully",
            FeedItem: feedItem.dataValues
        });
    }
    catch(err){
        return res.status(500).send({ message: "Internal Server Error", error: err });
    }
}

export const DeleteFeedItem = async (req, res) => {
    try{
        const _id_feed_item = req.body._id_feed_item

        addtoBatch(async () => {
            await FeedItems_Write.destroy({
                where:{_id_feed_item: _id_feed_item}
            });
        });

        return res.status(201).json({
            message: "FeedItem deleted successfully",
        });

    }
    catch(err){
        return res.status(500).send({ message: "Internal Server Error", error: err });
    }
}