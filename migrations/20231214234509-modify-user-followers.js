'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('userFollowers', '_id_user_followers');
  },

  async down(queryInterface, Sequelize) {
    
    await queryInterface.addColumn('userFollowers', '_id_user_followers', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    });
  }
};
