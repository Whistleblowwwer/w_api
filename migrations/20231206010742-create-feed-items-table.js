"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("feedItems", {
            _id_feed_item: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            _id_user: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users", 
                    key: "_id_user",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },
            list_id_target: {
                type: Sequelize.ARRAY(Sequelize.UUID),
                allowNull: true
            },
            score: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            interaction: {
                type: Sequelize.ENUM(
                    'Like Review',
                    'Like Comment',
                    'Comment Review',
                    'Comment Comment',
                    'Create Review',
                    'Follow Business',
                    'Create Business'
                ),
                allowNull: false,
            },
            is_valid: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("feedItems");
    },
};

