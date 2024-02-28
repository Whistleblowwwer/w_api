'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // No necesitas hacer nada aquí para "up"
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('userIps');
    },
};
