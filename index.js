const express = require('express');
const volleyball = require('volleyball');
const cors = require(`cors`);

require('dotenv').config();

const app = express();

const middlewares = require('./src/auth/middlewares.js');

const auth = require(`./src/auth/index.js`);

app.use(volleyball);
app.use(
  cors({
    origin: 'https://jwtauthfrontend.herokuapp.com/',
  }),
);
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
