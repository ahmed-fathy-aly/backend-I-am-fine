var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var signInController = require('./controller/signInController.js');
var signUpController = require('./controller/signUpController.js');
var searchUserController = require('./controller/searchUserController.js');
var askAboutuserController = require('./controller/askAboutuserController.js');

config.configEnvironmentVariables();
config.configDb();

var app = express();
app.use(bodyParser.json());

app.post('/sign_up', signUpController.signUp);
app.post('/sign_in', signInController.signIn);
app.get('/search_user', searchUserController.searchUser);
app.post('/ask_about_user', askAboutuserController.askAboutUser);
app.listen(process.env.PORT, () => {
  console.log(`started on port ${process.env.PORT}`);
});

module.exports.app = app;
