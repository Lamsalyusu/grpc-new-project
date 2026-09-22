'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notifications', 'updated_at');
  }
};



// 'use strict';

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     const tableInfo = await queryInterface.describeTable('notifications');
    
//     // Only add the column if MariaDB hasn't already created it
//     if (!tableInfo.updated_at) {
//       await queryInterface.addColumn('notifications', 'updated_at', {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
//       });
//     }
//   },

//   async down(queryInterface, Sequelize) {
//     const tableInfo = await queryInterface.describeTable('notifications');
//     if (tableInfo.updated_at) {
//       await queryInterface.removeColumn('notifications', 'updated_at');
//     }
//   }
// };
