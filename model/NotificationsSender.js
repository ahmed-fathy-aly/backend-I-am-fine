var request = require('request');
var requestPromise = require('request-promise');

module.exports.sendNotification = (tokens, data) => {
  console.log("sending notification to " + tokens);
  var options =
  {
      method: 'POST',
      uri: 'https://gcm-http.googleapis.com/gcm/send',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=' + process.env.NOTIFICATIONS_KEY
      },
      body: {
        'data': data,
        'registration_ids': tokens
      },
      json: true // Automatically parses the JSON string in the response
  };

  requestPromise(options)
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    })

}
