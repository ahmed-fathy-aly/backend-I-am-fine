var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User} = require('./../model/user.js');


module.exports.signIn = (req, res) => {
  // get body arguments
  var email = req.body.email;
  var password = req.body.password;

  // validate them
  var errors = [];
  if (!email || !validator.isEmail(email))
    errors.push("invalid_mail");
  if (!password || password.trim().length == 0)
    errors.push("invalid_password");
  if(errors.length > 0) {
    return responseHelper.multipleErrorResponse(res, errors);
  }
  var foundUser;

  // check if mail already exists
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        responseHelper.multipleErrorResponse(res, ["email_not_found"]);
        throw null;
      } else {
        return user;
      }
    })

    // check password
    .then(user => {
      foundUser = user;
      return encrypter.compare(password, user.password);
    })

    // update the notificationToken
    .then(equalPassword => {
      if(!equalPassword) {
        responseHelper.multipleErrorResponse(res, ["wrong_password"]);
        throw null;
      } else {
        const notificationToken = req.body.notificationToken;
        foundUser.notificationToken = notificationToken;
        return foundUser.save();
      }
    })

    .then(user => {
      res.send({
        ok: 1,
        token: encrypter.idToJWT(foundUser._id.toString()),
        id: foundUser._id.toString()
      });
    })

    // catch unknown error
    .catch(e => {
      if(e) {
        responseHelper.unknownErrorResponse(res, e);
      }
    });

}
