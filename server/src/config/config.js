// require('dotenv').config();

// module.exports = {
//   development: {
//     use_env_variable: 'DATABASE_URL',
//     dialect: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     }
//   }
// };


require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'InternProjectDB',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  },
  // test: {
  //   username: process.env.DB_USER || 'root',
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_NAME_TEST || 'taskmanager_test',
  //   host: process.env.DB_HOST || '127.0.0.1',
  //   port: process.env.DB_PORT || 3306,
  //   dialect: 'mysql',
  //   logging: false
  // },
  // production: {
  //   username: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_NAME,
  //   host: process.env.DB_HOST,
  //   port: process.env.DB_PORT,
  //   dialect: 'mysql',
  //   logging: false
  // }
};
