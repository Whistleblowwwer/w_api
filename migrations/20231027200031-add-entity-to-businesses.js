"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("businesses", "entity", {
            type: Sequelize.STRING(255),
            allowNull: true, // Change to false if null is not allowed
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("businesses", "entity");
    },
};
