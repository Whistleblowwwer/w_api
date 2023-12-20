// migrations/xxxx-create-article.js
"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("articles", {
            _id_article: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            published_at: {
                type: Sequelize.DATE,
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            _id_user: {
                type: Sequelize.UUID,
                references: {
                    model: "users",
                    key: "_id_user",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            _id_category: {
                type: Sequelize.UUID,
                references: {
                    model: "categories",
                    key: "_id_category",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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
    down: async (queryInterface) => {
        await queryInterface.dropTable("articles");
    },
};
