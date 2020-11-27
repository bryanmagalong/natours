/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

// Tour schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [ true, 'A tour must have a name!' ],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    require: [ true, 'A tour must have a price!' ],
  },
});

const Tour = mongoose.model('Tour', tourSchema); // creates a model from the tour schema

const app = require('./app');

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});
