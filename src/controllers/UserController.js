const db = require(`../db/connection.js`);
const Joi = require(`joi`);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = db.get(`users`);
users.createIndex(`username`, { unique: true });
const schema = Joi.object().keys({
  username: Joi.string()
    .regex(/(^[a-zA-Z0-9_]+$)/)
    .min(2)
    .max(30)
    .required(),
  password: Joi.string()
    .min(10)
    .trim()
    .required(),
});

class UserController {
  async signup(req, res, next) {
    const result = Joi.validate(req.body, schema);
    const { username, password } = req.body;
    if (result.error === null) {
      //make sure username is unique
      users
        .findOne({
          username: username,
        })
        .then(user => {
          if (user) {
            // there is already an user with that username
            // respond with an error
            const error = new Error(
              'That username is not OG. Please choose another one.',
            );
            res.status(409);
            next(error);
          } else {
            //hash the password
            bcrypt.hash(password.trim(), 12).then(hashedPassword => {
              //insert the hashed password in db
              const newUser = {
                username: username,
                password: hashedPassword,
                created: new Date(),
              };

              users.insert(newUser).then(_insertedUser => {
                //remove the password from the object before create token
                const insertedUser = {
                  username: _insertedUser.username,
                  created: _insertedUser.created,
                  _id: _insertedUser._id,
                };

                createTokenSendResponse(insertedUser, res, next);
              });
            });
          }
        });
    } else {
      res.status(422);
      next(result.error);
    }
  }
  async login(req, res, next) {
    const result = Joi.validate(req.body, schema);
    const { username, password } = req.body;
    if (result.error === null) {
      users
        .findOne({
          username,
        })
        .then(user => {
          if (user) {
            //user found.. attempt to compare password to the hashsed password in db

            bcrypt.compare(password.trim(), user.password).then(result => {
              if (result) {
                createTokenSendResponse(user, res, next);
              } else {
                respondError422(res, next);
              }
            });
          } else {
            respondError422(res, next);
          }
        });
    } else {
      respondError422(res, next);
    }
  }
}
const respondError422 = (res, next) => {
  res.status(422);
  const error = new Error('Unable to login.');
  next(error);
};
const createTokenSendResponse = (user, res, next) => {
  const payload = {
    _id: user._id,
    username: user.username,
  };
  jwt.sign(
    payload,
    process.env.TOKEN_SECRET,
    {
      expiresIn: '1d',
    },
    (err, token) => {
      if (err) {
        respondError422(res, next);
      } else {
        res.json({
          token,
        });
      }
    },
  );
};

module.exports = new UserController();
