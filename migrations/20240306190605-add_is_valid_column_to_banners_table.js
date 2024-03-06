"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("banners", "is_valid", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("banners", "is_valid");
    },
};
