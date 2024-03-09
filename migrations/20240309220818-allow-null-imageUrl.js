"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.changeColumn("ads", "imageUrl", {
            type: Sequelize.STRING,
            allowNull: true, // Change allowNull to true to allow NULL values
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.changeColumn("ads", "imageUrl", {
            type: Sequelize.STRING,
            allowNull: false, // Change allowNull back to false if needed
        });
    },
};
