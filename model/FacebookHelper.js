var request = require('request');
var requestPromise = require('request-promise');

module.exports.authenticateToken = (facebookToken) => {
  return new Promise((resolve, reject) => {
    var options =
    {
        method: 'GET',
          uri: `https://graph.facebook.com/me?fields=id,name&access_token=${facebookToken}`,
        json: true
    };
    requestPromise(options)
      .then(result => {
        if (result.id == null) {
          reject({'error' : 'no id found'});
        } else {
          resolve({
            'ok': 1,
            'facebookId': result.id,
            'name': result.name,
            'profilePicture' : `http://graph.facebook.com/${result.id}/picture?type=square&width=1000`
          });
         }

      })
      .catch(e => {
        resolve({
          'ok' : 0,
          'error' : e
        });
      });
  });
}

module.exports.getFriends = (facebookToken) => {
  return new Promise((resolve, reject) => {
    var options =
    {
        method: 'GET',
          uri: `https://graph.facebook.com/me/friends?access_token=${facebookToken}`,
        json: true
    };
    requestPromise(options)
      .then(result => {
        if (result.data == null) {
          reject({'error' : 'no id found'});
        } else {
          const ids = Array.from(result.data.map(item => item.id));
          resolve(ids);
         }
      })
      .catch(e => {
        reject(e);
      });
  });
}
