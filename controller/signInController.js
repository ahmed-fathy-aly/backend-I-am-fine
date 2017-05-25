var validator = require('validator');
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
    return res.send({
        ok: 0,
        errors: errors
      });
  }
  var foundUser;

  // check if mail already exists
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        res.send({
            ok: 0,
            errors: ["email_not_found"]
          });
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

    // send reult
    .then(equalPassword => {
      if(equalPassword) {
        res.send({
          ok: 1,
          token: encrypter.idToJWT(foundUser._id.toString()),
          id: foundUser._id.toString()
        });
      } else {
        res.send({
          ok: 0,
          errors: ["wrong_password"]
        });
      }
    })

    // catch unknown error
    .catch(e => {
      if(e){
        console.log(`error ${e}`);
        res.status(500).send(e);
      }
    });

}