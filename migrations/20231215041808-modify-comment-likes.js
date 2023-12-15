'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    
    const tableDescription = await queryInterface.describeTable('commentLikes');

    
    if (tableDescription['_id_comment_likes']) {
      await queryInterface.removeColumn('commentLikes', '_id_comment_likes');
    }

    if (!tableDescription['_id_user']) {
      await queryInterface.addColumn('commentLikes', '_id_user', {
        type: Sequelize.UUID,
        references: {
          model: 'users', 
          key: '_id_user',
        }
      });
    }

    if (!tableDescription['_id_comment']) {
      await queryInterface.addColumn('commentLikes', '_id_comment', {
        type: Sequelize.UUID,
        references: {
          model: 'comments', 
          key: '_id_comment',
        }
      });
    }
  },

  async down(queryInterface, Sequelize) {
    
  }
};

