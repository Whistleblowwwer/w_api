// Example: migrations/YYYYMMDDHHMMSS-change_image_url_datatype.js

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("reviewImages", "image_url", {
            type: Sequelize.TEXT,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("reviewImages", "image_url", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },
};
