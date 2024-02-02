"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add a new column with the correct data type
        await queryInterface.addColumn("notifications", "_id_target", {
            type: Sequelize.UUID,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the new column in the down migration
        await queryInterface.removeColumn("notifications", "_id_target");
    },
};
