const express = require('express');
const volleyball = require('volleyball');
const cors = require('cors');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
});

require('dotenv').config();
const middlewares = require('./src/auth/middlewares.js');
const auth = require(`./src/auth/index.js`);

const app = express();

app.use(cors());
app.use(volleyball);
app.use(express.json());
app.use(middlewares.checkTokenSetUser);

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World',
    user: req.user,
  });
});

app.use(`/auth`, auth);

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  // res.status(404);
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 6110;
app.listen(port, () => {
  console.log(`Listening on port`, port);
});
