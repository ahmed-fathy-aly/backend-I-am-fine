var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User} = require('./../model/user.js');

module.exports.signUp = (req, res) => {
  // get body arguments
  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;

  // validate them
  var errors = [];
  if (!email || !validator.isEmail(email))
    errors.push("invalid_mail");
  if (!name || name.trim().length == 0)
     errors.push("invalid_name");
  if (!password || password.trim().length == 0)
    errors.push("invalid_password");
  if(errors.length > 0) {
    return responseHelper.multipleErrorResponse(res, errors);
  }

  // check if mail already exists
  User.findOne({email: email})
    .then(user => {
      if (user) {
        responseHelper.multipleErrorResponse(res, ["duplicate_mail"]);
        throw null;
      }
      else {
        // encrypt the password
        return encrypter.encrypt(password);
    }
    })

    // create a new user
    .then(encrypedPassword => {
      var user = new User({
        email: email,
        name: name,
        password: encrypedPassword,
        lastFineTime: new Date()
      });
      return user.save();
    })

    // user created
    .then(user => {
        return res.send({
          ok: 1,
          token: encrypter.idToJWT(user._id.toString()),
          id: user._id.toString()
        })
      })

    // catch unknown error
    .catch(e => {
      if(e){
        console.log(`error ${e}`);
        res.status(500).send(e);
      }
    });
}
