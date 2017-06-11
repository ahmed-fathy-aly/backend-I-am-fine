var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User, WhoAsked} = require('./../model/user.js');

module.exports.askAboutUser = (req, res) => {

  // authorize
  const token = req.body.token;
  var askerId;
  var askedAbout;

  if(!token) {
      return responseHelper.unAuthorizedResponse(res);;
  }
  encrypter.JWTToId(token)
  .then(id => {
    askerId = id;
    return id;
  }, err => {
      responseHelper.unAuthorizedResponse(res);
      throw null;
  })

  // get the user to be asked about
  .then(id => {
    var userId = req.body.userId;
    return User.findById(userId).populate({
        path: 'usersAsked',
        populate: {path: 'asker'}
    });
  })

  // get the asker
  // create the entry for asking
  .then(user => {
    // asker not found
    if(!user) {
      responseHelper.singleErrorResponse(res,'invalid_user_id');
      throw null;
    }

    // create the who asked entry
    askedAbout = user;
    var askedAboutEntry = new WhoAsked({
      asker: askerId,
      askTime: new Date()
    });
    return askedAboutEntry.save();
  })

  // update the asked about's who asked
  .then(askedAboutEntry => {
    askedAbout.usersAsked = askedAbout.usersAsked.filter(x => x.asker.id != askerId);
    askedAbout.usersAsked.push(askedAboutEntry._id);
    return askedAbout.save();
  })

  // done
  .then(() => {
    res.send({ok: 1});
  })

  .catch(e => {
    if(e) {
      console.log("Unknown error !");
      console.log(e);
    }
  })
}
