"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("ads", "_id_business", {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: "d2aa7d5e-b3db-45cf-b963-260f494ec379", // Default value for existing entries
            references: {
                model: "businesses",
                key: "_id_business",
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("ads", "_id_business");
    },
};
