"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("articles", "img_url", {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue:
                "https://www.integrityline.com/wp-content/uploads/2021/12/integrityline-blog_was-ist-ein-wb-1024x576.jpg",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("articles", "img_url");
    },
};
