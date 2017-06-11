var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User, WhoAsked} = require('./../model/user.js');

module.exports.sayIAmFine = (req, res) => {

  // authorize
  const token = req.body.token;
  var fineUser;

  if(!token) {
    return responseHelper.unAuthorizedResponse(res);
  }
  encrypter.JWTToId(token)
  .then(id => {
    return id;
  }, err => {
    responseHelper.unAuthorizedResponse(res);
    throw null;
  })

  // get the user
  .then(id => {
    return User.findById(id).populate({
        path: 'usersAsked',
        populate: {path: 'asker'}
    });
  })

  // delete the who asked entries related to that user
  .then(user => {
    // user not found
    if(!user) {
      responseHelper.singleErrorResponse(res, "invalid_id");
      throw null;
    }

    fineUser = user;
    whoAskedIds = user.usersAsked.map(entry => entry._id);
    return WhoAsked.remove({_id: {$in: whoAskedIds }});
  })

  // clear reference from user to who asked
  .then((deleted) => {
    fineUser.lastFineTime = new Date();
    fineUser.usersAsked = [];
    return fineUser.save();
  })

  // done
  .then(() => {
    res.send({ok: 1});
  })

  .catch(e => {
    if(e) {
      responseHelper.unknownErrorResponse(res, e);
    }
  })
}
