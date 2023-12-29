"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("users", "blockedBy", {
            type: Sequelize.ARRAY(Sequelize.UUID),
            allowNull: true,
            defaultValue: [],
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("users", "blockedBy");
    },
};
