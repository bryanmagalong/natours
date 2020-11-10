const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // configure environment variables from the config.env file
// Need to be configured before running the app file
// console.log(process.env); // Display environment variables

const app = require('./app');

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});
