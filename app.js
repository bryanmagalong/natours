const express = require('express');

const app = express();

/**
 * app.get(route, callback)
 * res.status(statusCode).json(Object)
 */
app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello from the server side!', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post in to this endpoints ... ');
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});
