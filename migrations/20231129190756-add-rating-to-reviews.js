"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("reviews", "rating", {
            type: Sequelize.FLOAT,
            allowNull: true,
            validate: {
                min: 0,
                max: 5,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("reviews", "rating");
    },
};
