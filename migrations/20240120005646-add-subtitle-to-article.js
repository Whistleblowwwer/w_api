"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("articles", "subtitle", {
            type: Sequelize.TEXT,
            allowNull: true, // Adjust as needed
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("articles", "subtitle");
    },
};
