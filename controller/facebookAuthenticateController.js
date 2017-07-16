var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User} = require('./../model/user.js');
var facebookHelper = require('./../model/FacebookHelper.js');

module.exports.authenticate = (req, res) => {
  const facebookToken = req.body.facebookToken;
  var facebookResult;

  // authenticate the facebook token to get the facebook id
  facebookHelper
    .authenticateToken(facebookToken)
    .then((facebookResultRecieved, e)  => {
      if(e != null || facebookResultRecieved.ok != 1) {
        responseHelper.singleErrorResponse(res, 'invalid_token');
        throw null;
      } else {
        facebookResult = facebookResultRecieved;
        return User.findOne({facebookId: facebookResult.facebookId});
      }
    })

    // check if user already existing then edit the notifications token
    // else create it
    .then(user => {
      if(user == null) {
        var user = new User({
          email: null,
          name: facebookResult.name,
          password: null,
          notificationToken: req.body.notificationToken,
          lastFineTime: new Date(),
          profilePicture: facebookResult.profilePicture,
          facebookId: facebookResult.facebookId
        });
        return user.save();
      } else {
        user.notificationToken = req.body.notificationToken;
        return user.save();
      }
    })

    // user saved
    .then(user =>{
      return res.send({
        ok: 1,
        token: encrypter.idToJWT(user._id.toString()),
        id: user._id.toString()
      });
    })

    // catch unknown error
    .catch(e => {
      if(e) {
        console.log("eah elly gabak hena");
        responseHelper.unknownErrorResponse(res, e);
      }
    });
}
