var validator = require('validator');
var responseHelper = require('./responseHelper.js');
var encrypter = require('./../model/encrypter.js');
var {User, WhoAsked} = require('./../model/user.js');
var notificationsSender = require('./../model/NotificationsSender.js');

module.exports.sayIAmFine = (req, res) => {
  var fineUser;
  var whoAskedNotificationTokens;

  // authorize
  responseHelper.authorizeRequest(req, res)

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
    whoAskedNotificationTokens = user.usersAsked
                                .map(entry => entry.asker.notificationToken)
                                .filter(token => token != null);
    whoAskedIds = user.usersAsked
                  .map(entry => entry._id)
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
    if(whoAskedNotificationTokens.length > 0) {
      notificationsSender.sendNotification(whoAskedNotificationTokens, {
      'type' : 'someoneSaidIAmFine',
      'fineUserId' : fineUser._id.toString(),
      'fineUserName' : fineUser.name,
      'fineUserTime' : fineUser.lastFineTime.toString()});
    }
  })

  .catch(e => {
    if(e) {
      responseHelper.unknownErrorResponse(res, e);
    }
  })
}
