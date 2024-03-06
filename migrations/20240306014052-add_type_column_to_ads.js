"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("ads", "type", {
            type: Sequelize.ENUM("Banner", "Review"),
            allowNull: false,
            defaultValue: "Banner",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("ads", "type");
    },
};
