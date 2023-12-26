'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('businesses', 'iso2_country_code', {
            type: Sequelize.STRING(3),
            allowNull: true
        });
        await queryInterface.changeColumn('businesses', 'iso2_state_code', {
            type: Sequelize.STRING(3),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('businesses', 'iso2_country_code', {
            type: Sequelize.STRING(2),
            allowNull: true
        });
        await queryInterface.changeColumn('businesses', 'iso2_state_code', {
            type: Sequelize.STRING(2),
            allowNull: true
        });
    }
};

