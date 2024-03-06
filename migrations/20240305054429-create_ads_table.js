"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("ads", {
            _id_ad: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            imageUrl: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            start_campaign_date: {
                type: Sequelize.DATE,
            },
            end_campaign_date: {
                type: Sequelize.DATE,
            },
            duration_days: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            clickUrl: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM("active", "paused", "expired"),
                allowNull: false,
                defaultValue: "active",
            },
            is_valid: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            _id_user: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "_id_user",
                },
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("ads");
    },
};
