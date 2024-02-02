"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("notifications", {
            _id_notification: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            _id_user_sender: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            _id_user_receiver: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            _id_target: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            type: {
                type: Sequelize.ENUM(
                    "chat",
                    "review",
                    "comment",
                    "profile",
                    "news",
                    "business",
                    "alert",
                    "advertisement"
                ),
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            is_followed: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            is_valid: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("notifications");
    },
};
