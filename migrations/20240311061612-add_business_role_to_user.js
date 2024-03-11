"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("users", "role", {
            type: Sequelize.ENUM("consumer", "admin", "business"),
            allowNull: false,
            defaultValue: "consumer",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("users", "role", {
            type: Sequelize.ENUM("consumer", "admin"),
            allowNull: false,
            defaultValue: "consumer",
        });
    },
};
