'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.removeColumn('businessFollowers', '_id_business_followers');
  },

  async down(queryInterface, Sequelize) {
    
    await queryInterface.addColumn('businessFollowers', '_id_business_followers', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    });
  }
};

