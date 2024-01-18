"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("articles", "categoryId", {
            type: Sequelize.UUID,
            allowNull: true, // Adjust as needed
            references: {
                model: "categories", // Replace with the actual table name of your Category model
                key: "_id_category",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL", // Adjust as needed
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("articles", "categoryId");
    },
};
