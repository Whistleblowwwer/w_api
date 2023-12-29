// migrations/XXXXXX-change-iso-code-length.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("businesses", "iso2_country_code", {
            type: Sequelize.STRING(4),
            allowNull: true,
        });

        await queryInterface.changeColumn("businesses", "iso2_state_code", {
            type: Sequelize.STRING(4),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // If needed, you can revert the changes here
        await queryInterface.changeColumn("businesses", "iso2_country_code", {
            type: Sequelize.STRING(3),
            allowNull: true,
        });

        await queryInterface.changeColumn("businesses", "iso2_state_code", {
            type: Sequelize.STRING(3),
            allowNull: true,
        });
    },
};
