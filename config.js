var mongoose = require('mongoose');
var bodyParser = require('body-parser');

module.exports.configEnvironmentVariables = () => {
  var env = process.env.NODE_ENV || "development";
  if(env == "development") {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/app4";
  } else if (env == "test"){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/app4-test";
  }
  process.env.SECRET_KEY = "hamada";
  process.env.NOTIFICATIONS_KEY = "AAAA9mYUG0s:APA91bEusAXyG-PROMJ8fRHdKMJi1oVesxBnVgEEuP51xteI333sTaWRA0kbEQnUewSZxuJzrPg7mIHgZ1bkL0WlgixyXnZI4W8X2LNU8HOejqX4y_2nuY3_fCmpcmcHoz57fhwIdm3t";
};

module.exports.configDb = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGODB_URI);
};
