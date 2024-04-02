'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adding a new column 'is_read' to the 'messages' table
        await queryInterface.addColumn('messages', 'is_read', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
  },

  async down (queryInterface, Sequelize) {
        // Removing the column 'is_read' from the 'messages' table in case of rollback
        await queryInterface.removeColumn('messages', 'is_read');

  }
};
