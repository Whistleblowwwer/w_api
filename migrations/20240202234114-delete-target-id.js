"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove the old column
        await queryInterface.removeColumn("notifications", "_id_target");
    },

    down: async (queryInterface, Sequelize) => {
        // If needed, you can recreate the column in the down migration
        await queryInterface.addColumn("notifications", "_id_target", {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
