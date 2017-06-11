var validator = require('validator');
var encrypter = require('./../model/encrypter.js');
var responseHelper = require('./responseHelper.js');
var {User, WhoAsked} = require('./../model/user.js');

module.exports.whoAskedAboutMe = (req, res) => {

  // authorize
  responseHelper.authorizeRequest(req, res)

  // get who asked about me
  .then(id => {
    return User.findById(id).populate({
        path: 'usersAsked',
        populate: {path: 'asker'}
    });
  })

  // convert result to json response
  .then(user => {
    if(!user) {
      responseHelper.singleErrorResponse(res, "invalid_id");
      throw null;
    }
    whoAsked = user.usersAsked.map(entry => {
      return {
        id: entry.asker.id,
        name: entry.asker.name,
        email: entry.asker.email,
        askTime: entry.askTime
      };
    });
    res.send({
      ok : 1,
      whoAsked : whoAsked
    });
  })

  // Unknown error
  .catch(e => {
    if(e) {
      responseHelper.unknownErrorResponse(res, e);
    }
  });
}
