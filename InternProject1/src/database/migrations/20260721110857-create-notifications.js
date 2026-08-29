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
    await queryInterface.createTable('notifications',{
      id:{
        type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:Sequelize.UUIDV4,
      },
      user_id:{
        type:Sequelize.UUID,
        allowNull:false,
        references:{
          model:'users',
          key:'id',
        },
        onDelete:'CASCADE'
      },
      type:{
        type:Sequelize.STRING,
        allowNull:false,
      },
      payload:{
        type:Sequelize.JSON,
        allowNull:true,
      },
      read_at:{
        type:Sequelize.DATE,
        allowNull:false,

      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.NOW,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
    */
   await queryInterface.dropTable('notifications')
  }
};
