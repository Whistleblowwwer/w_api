"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("businesses", "iso2_country_code", {
            type: Sequelize.STRING(2),
            allowNull: true,
        });

        await queryInterface.addColumn("businesses", "iso2_state_code", {
            type: Sequelize.STRING(2),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("businesses", "iso2_country_code");
        await queryInterface.removeColumn("businesses", "iso2_state_code");
    },
};
