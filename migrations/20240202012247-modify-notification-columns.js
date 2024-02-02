"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Modify columns to UUID and add references
        await queryInterface.changeColumn("notifications", "_id_user_sender", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "_id_user",
            },
        });

        await queryInterface.changeColumn(
            "notifications",
            "_id_user_receiver",
            {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "_id_user",
                },
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert changes in case of rollback
        await queryInterface.changeColumn("notifications", "_id_user_sender", {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.changeColumn(
            "notifications",
            "_id_user_receiver",
            {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        );
    },
};
