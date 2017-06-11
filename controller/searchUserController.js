var encrypter = require('./../model/encrypter.js');
var {User} = require('./../model/user.js');

module.exports.searchUser = (req, res) => {

  // authorize
  const token = req.query.token;
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

  // validate fields
  .then(id => {
    const userName = req.query.userName;
    if(!userName) {
      res.send({ok: 0, errors: ["invalid_user_name"]});
      throw null;
    } else {
      return userName;
    }
  })

  // search for matching names
  .then((userName) => {
    var regex = new RegExp('/*' + userName + '/*', 'i');
    return User.find({name: regex})
  })

  // convert users
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
    if(e) {
      console.log("Unknown error !");
      console.log(e);
    }
  })
}
