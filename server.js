/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('=======/ UNCAUGHT EXCEPTION /========');
  console.log('===/Error: ', err.name);
  console.log('===/Message: ', err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' }); // configure environment variables from the config.env file
// Need to be configured before running the app file
// console.log(process.env); // Display environment variables

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!!!'));

const app = require('./app');

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

process.on('unhandledRejection', (err) => {
  console.log('=======/Error: ', err.name);
  console.log('=======/Message: ', err.message);
  console.log('=======/ UNHANDLED REJECTION /========');

  server.close(() => {
    process.exit(1);
  });
});
