"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("users", "email", {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: false, // Change the uniqueness constraint to false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("users", "email", {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true, // Change back the uniqueness constraint to true if rolling back
        });
    },
};
