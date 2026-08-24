'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('notifications', 'read_at', {
      type: Sequelize.DATE,
      allowNull: true,  // ← unread notifications have null read_at
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.changeColumn('notifications', 'read_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
