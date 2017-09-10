var encrypter = require('./../model/encrypter.js');
var responseHelper = require('./responseHelper.js');
var {User} = require('./../model/user.js');
var SmartRec = require('./../model/smartRec.js');

module.exports.recommendUsers = (req, res) => {

  // authorize
  responseHelper.authorizeRequest(req, res)

  // validate fields
  .then(id => {
    const facebookToken = req.query.facebookToken;
    return SmartRec.getSuggestedUsers(id, facebookToken)
  })

  // convert ids to users
  .then(ids => {
    return User.find({'_id' : {$in : ids}})
  })

  // format users
  .then(users => {
      return users.map(user => {
        return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        lastFineTime: user.lastFineTime.toISOString()
      }
    });
  })

  // respond
  .then(formattedUsers => {
    res.send(
      {
        ok:1,
        users: formattedUsers
      }
    );
  })

  .catch(e => {
    console.log(e)
    if(e) {
      responseHelper.unknownErrorResponse(res, e);
    }
  })
}
