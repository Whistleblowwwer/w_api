'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Primero, elimina la tabla existente si existe
        await queryInterface.dropTable('userIps', { force: true });

        // Luego, crea la nueva tabla con la estructura actualizada
        await queryInterface.createTable('userIps', {
            _id_ip: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            _id_user: {
                type: Sequelize.UUID,
                references: {
                    model: 'users', 
                    key: '_id_user',
                },
            },
            _ip_address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING,
            },
            country: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Para revertir, simplemente elimina la tabla
        await queryInterface.dropTable('userIps');
    },
};
