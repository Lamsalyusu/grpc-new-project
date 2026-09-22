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

    await queryInterface.createTable('collaboration_requests',{
      id:{
        type:Sequelize.UUID, 
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        allowNull:false
      },
      sender_id:{
        type:Sequelize.UUID,
        allowNull:false,
        references:{
        model:'users',
        key:'id',
          },
      },

    receiver_id:{
      type:Sequelize.UUID,
      allowNull:false,
      references:{
        model:'users',
        key:'id'
      }
    },

    status:{
      type:Sequelize.STRING,
      allowNull:false,
      defaultValue:'pending'
    },

    created_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.NOW
    },

    updated_at:{
      type:Sequelize.DATE,
      allowNull:false,
      defaultValue:Sequelize.NOW
    },
    
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('collaboration_requests')
  }
};
