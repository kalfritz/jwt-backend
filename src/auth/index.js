const express = require(`express`);
const routes = express.Router();

const UserControllers = require('../controllers/UserController');

//pre-pended with /auth

routes.post('/signup', UserControllers.signup);
routes.post('/login', UserControllers.login);

module.exports = routes;
