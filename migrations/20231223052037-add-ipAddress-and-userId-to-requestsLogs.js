// XXXXXXXXXXXXXXXX-add-ipAddress-and-userId-to-requestsLogs.js
"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("requestsLogs", "_id_user", {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("requestsLogs", "_ip_address");
        await queryInterface.removeColumn("requestsLogs", "_id_user");
    },
};
