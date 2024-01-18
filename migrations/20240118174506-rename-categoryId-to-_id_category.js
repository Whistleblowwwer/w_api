"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "articles",
            "categoryId",
            "_id_category"
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "articles",
            "_id_category",
            "categoryId"
        );
    },
};
