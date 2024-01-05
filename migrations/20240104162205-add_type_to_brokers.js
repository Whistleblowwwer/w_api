"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("brokers", "type", {
            type: Sequelize.ENUM("attorney", "assistant"),
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("brokers", "type");
    },
};
