"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove columns
        await queryInterface.removeColumn("ErrorLogs", "userIP");
        await queryInterface.removeColumn("ErrorLogs", "timestamp");

        // Add new columns
        await queryInterface.addColumn("ErrorLogs", "continent", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "continentCode", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "country", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "countryCode", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "city", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "zip", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "lat", {
            type: Sequelize.FLOAT,
        });
        await queryInterface.addColumn("ErrorLogs", "lon", {
            type: Sequelize.FLOAT,
        });
        await queryInterface.addColumn("ErrorLogs", "timezone", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "offset", {
            type: Sequelize.INTEGER,
        });
        await queryInterface.addColumn("ErrorLogs", "requestMethod", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "queryRoute", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "_ip_address", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "_id_user", {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert changes if needed
        await queryInterface.addColumn("ErrorLogs", "userIP", {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn("ErrorLogs", "timestamp", {
            type: Sequelize.DATE,
        });

        // Remove new columns
        await queryInterface.removeColumn("ErrorLogs", "continent");
        await queryInterface.removeColumn("ErrorLogs", "continentCode");
        await queryInterface.removeColumn("ErrorLogs", "country");
        await queryInterface.removeColumn("ErrorLogs", "countryCode");
        await queryInterface.removeColumn("ErrorLogs", "city");
        await queryInterface.removeColumn("ErrorLogs", "zip");
        await queryInterface.removeColumn("ErrorLogs", "lat");
        await queryInterface.removeColumn("ErrorLogs", "lon");
        await queryInterface.removeColumn("ErrorLogs", "timezone");
        await queryInterface.removeColumn("ErrorLogs", "offset");
        await queryInterface.removeColumn("ErrorLogs", "requestMethod");
        await queryInterface.removeColumn("ErrorLogs", "queryRoute");
        await queryInterface.removeColumn("ErrorLogs", "_ip_address");
        await queryInterface.removeColumn("ErrorLogs", "_id_user");
    },
};
