"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("user_topic_subscriptions", {
            _id_user_topic_subscription: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            _id_user: {
                type: Sequelize.UUID,
                references: {
                    model: "users", // This should be the table name for your User model
                    key: "_id_user",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            _id_topic: {
                type: Sequelize.UUID,
                references: {
                    model: "topics",
                    key: "_id_topic",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("user_topic_subscriptions");
    },
};
