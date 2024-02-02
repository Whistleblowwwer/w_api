"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("notifications", "createdAt", {
            type: Sequelize.DATE,
            allowNull: false,
        });

        await queryInterface.addColumn("notifications", "updatedAt", {
            type: Sequelize.DATE,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("notifications", "createdAt");
        await queryInterface.removeColumn("notifications", "updatedAt");
    },
};
