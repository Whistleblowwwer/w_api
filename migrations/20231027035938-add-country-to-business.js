"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("businesses", "country", {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: "BTEST",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("businesses", "country");
    },
};
