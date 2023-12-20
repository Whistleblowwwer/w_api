'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('categories', 'parent_id', '_id_parent');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('categories', '_id_parent', 'parent_id');
  }
};
