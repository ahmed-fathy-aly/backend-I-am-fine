var {User} = require('./user.js');
var FacebookHelper = require('./FacebookHelper.js');

module.exports.registerUserAsked = (askerId, askedAboutId) => {
  return new Promise((resolve, reject) => {
    User.findOne({_id: askedAboutId})
      .then(user => {
        if(user.usersAskedHistory.indexOf(askerId) != -1) {
          user.usersAskedHistory.remove(askerId)
        }
        user.usersAskedHistory.unshift(askerId);
        return user.save();
      })

      .then( () => {
        resolve();
      })
  });
}

module.exports.getSuggestedUsers = (userId, facebookToken) => {
  return new Promise((resolve, reject) => {
    var askedAboutMe;

    // first get the users asked about me
    User.findOne({_id: userId})
      .then(user => {
        return user.usersAskedHistory;
      })

    // get the facebook friends if found
    .then(usersAsked => {
      askedAboutMe = usersAsked;
      return getFacebookFriends(facebookToken);
    })

    // merge who asked about me with the facebook friends
    .then(foundFriends => {
      resolve(mergeNoDuplicates(askedAboutMe, foundFriends));
    })

    .catch(e => {
      if (e != null) {
        reject(e);
      }
    });

  });
}

function getFacebookFriends(facebookToken) {
  return new Promise( (resolve, reject) => {
    if (facebookToken == null) {
      resolve([]);
      return;
    }

    FacebookHelper.getFriends(facebookToken)
      .then(facebookIds => {
        return User.find({'facebookId' : {$in : facebookIds}})
      })
      .then(users => {
        resolve(Array.from(users.map(item => item._id)));
      })
      .catch(e => {
        console.log("unknown error " + e);
        resolve([]);
      })
  });
}

function mergeNoDuplicates(arr1, arr2) {
  var set = {};
  var result = [];
  const addIfNotThere = (item) => {
    if(set[item] != 1) {
      set[item] = 1;
      result.push(item);
    }
  };
  if (arr1 != null) {
    arr1.forEach(addIfNotThere);
  }
  if (arr2 != null) {
    arr2.forEach(addIfNotThere);
  }
  return result;
}
