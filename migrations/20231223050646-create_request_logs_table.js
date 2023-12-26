// XXXXXXXXXXXXXXXX-create-requests-logs-table.js
"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("requestsLogs", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            continent: Sequelize.STRING,
            continentCode: Sequelize.STRING,
            country: Sequelize.STRING,
            countryCode: Sequelize.STRING,
            city: Sequelize.STRING,
            zip: Sequelize.STRING,
            lat: Sequelize.FLOAT,
            lon: Sequelize.FLOAT,
            timezone: Sequelize.STRING,
            offset: Sequelize.INTEGER,
            requestMethod: Sequelize.STRING,
            queryRoute: Sequelize.STRING,
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("requestsLogs");
    },
};
