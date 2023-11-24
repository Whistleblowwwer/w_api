"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("businesses", "category_id", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "categories",
                key: "_id_category",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("businesses", "category_id");
    },
};
