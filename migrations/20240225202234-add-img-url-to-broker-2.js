"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("brokers", "img_url", {
            type: Sequelize.STRING(255),
            allowNull: true, // Permitir valores nulos para los registros existentes
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("brokers", "img_url");
    },
};
