'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('reviewLikes');
    
    if (!tableDescription['_id_user']) {
      await queryInterface.addColumn('reviewLikes', '_id_user', {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        references: {
          model: 'Users', 
          key: '_id_user'
        }
      });
    }

    if (!tableDescription['_id_review']) {
      await queryInterface.addColumn('reviewLikes', '_id_review', {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        references: {
          model: 'Reviews', 
          key: '_id_review'
        }
      });
    }

    if (tableDescription['_id_review_likes']) {
      await queryInterface.removeColumn('reviewLikes', '_id_review_likes');
    }
  },

  async down(queryInterface, Sequelize) {
    
    await queryInterface.addColumn('reviewLikes', '_id_review_likes', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    });
    await queryInterface.removeColumn('reviewLikes', '_id_user');
    await queryInterface.removeColumn('reviewLikes', '_id_review');
  }
};

