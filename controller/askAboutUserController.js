var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User, WhoAsked} = require('./../model/user.js');
var notificationsSender = require('./../model/NotificationsSender.js');

module.exports.askAboutUser = (req, res) => {
  var askerId;
  var askedAbout;
  var askedAboutEntry;
  var notificationToken;

  // authorize
  responseHelper.authorizeRequest(req, res)

  // get the user to be asked about
  .then(id => {
    askerId = id;
    const userId = req.body.userId;
    if(!userId) {
      responseHelper.singleErrorResponse(res,'invalid_user_id');
      throw null;
    }

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
    askedAboutEntry = new WhoAsked({
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

  // send notification to that user
  .then(() => {
    res.send({ok: 1});
    notificationToken = askedAbout.notificationToken;
    if (notificationToken != null) {
      return User.findById(askerId);
    }
  })

  .then((asker) => {
    if(asker != null) {
      var data = {
           "type" : "someoneAskedAboutYou",
           "receiverId" : askedAbout._id.toString(),
           "askTime" : askedAboutEntry.askTime,
           "userId" : asker.id.toString(),
           "userName" : asker.name,
           "userEmail" : asker.email
      };
      notificationsSender.sendNotification([notificationToken], data);
    }
  })

  .catch(e => {
    if(e) {
      responseHelper.unknownErrorResponse(res, e);
    }
  })
}
