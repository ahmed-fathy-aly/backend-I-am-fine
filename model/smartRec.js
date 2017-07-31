var {User} = require('./user.js');

module.exports.registerUserAsked = (askerId, askedAboutId) => {
  return new Promise((resolve, reject) => {
    User.findOne({_id: askedAboutId})
      .then(user => {
        if(user.usersAskedHistory.indexOf(askerId) != -1) {
          user.usersAskedHistory.remove(askerId)
        }
        user.usersAskedHistory.unshift(askerId);
        console.log(user.usersAskedHistory);
        return user.save();
      })

      .then( () => {
        resolve();
      })
  });
}

module.exports.getSuggestedUsers = (userId) => {
  return new Promise((resolve, resject) => {
    User.findOne({_id: userId})
      .then(user => {
        resolve(user.usersAskedHistory);
      });
  });
}
