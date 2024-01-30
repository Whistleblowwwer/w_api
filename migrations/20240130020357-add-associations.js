"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add association for ErrorLog model
        await queryInterface.addColumn("errorsLogs", "_id_user", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "_id_user",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });

        // Add association for Log model
        await queryInterface.addColumn("requestsLogs", "_id_user", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "_id_user",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove association for ErrorLog model
        await queryInterface.removeColumn("errorsLogs", "_id_user");

        // Remove association for Log model
        await queryInterface.removeColumn("requestsLogs", "_id_user");
    },
};
