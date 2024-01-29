"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("ErrorLogs", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            error: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userIP: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false,
            },
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
        await queryInterface.dropTable("ErrorLogs");
    },
};
