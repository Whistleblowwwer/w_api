// In a new migration file for Log, e.g., YYYYYYYY-add-deviceType-to-Log.js
"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("requestsLogs", "deviceType", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("requestsLogs", "deviceType");
    },
};
