"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Rename the column from category_id to _id_category
        await queryInterface.renameColumn(
            "businesses",
            "category_id",
            "_id_category"
        );

        // Update the references accordingly
        await queryInterface.sequelize.query(
            'ALTER TABLE "businesses" RENAME CONSTRAINT "businesses_category_id_fkey" TO "businesses__id_category_fkey"'
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes
        await queryInterface.renameColumn(
            "businesses",
            "_id_category",
            "category_id"
        );

        // Revert the constraint name as well
        await queryInterface.sequelize.query(
            'ALTER TABLE "businesses" RENAME CONSTRAINT "businesses__id_category_fkey" TO "businesses_category_id_fkey"'
        );
    },
};
