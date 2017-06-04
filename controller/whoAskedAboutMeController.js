var validator = require('validator');
var encrypter = require('./../model/encrypter.js');
var {User, WhoAsked} = require('./../model/user.js');

module.exports.whoAskedAboutMe = (req, res) => {
  // authorize
  const token = req.body.token;

  if(!token) {
    return res.send({ok: 0, errors: ["unauthorized"]});
  }
  encrypter.JWTToId(token)
  .then(id => {
    return id;
  }, err => {
    res.send({ok: 0, errors: ["unauthorized"]});
    throw null;
  })

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
      res.send({
        ok: 0,
        errors: "invalid_id"
      });
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
      console.log("Unknown error !");
      console.log(e);
    }
  })
}
