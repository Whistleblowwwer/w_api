// In a new migration file for ErrorLog, e.g., XXXXXXXX-add-deviceType-to-ErrorLog.js
"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("errorsLogs", "deviceType", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("errorsLogs", "deviceType");
    },
};
