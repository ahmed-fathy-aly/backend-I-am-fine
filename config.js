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
};

module.exports.configDb = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGODB_URI);
};
