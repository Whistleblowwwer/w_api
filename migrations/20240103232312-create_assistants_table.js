"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("assistants", {
            _id_assistant: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            INE: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },
            cell_phone_number: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            is_valid: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("assistants");
    },
};
