var mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String
  },
  name: {
    type: String
  },
  password: {
    type: String
  },
  lastFineTime: {
    type: Date
  },
  usersAsked: [{
    type: String
  }]
});

module.exports.User = mongoose.model('User', UserSchema);
/*
module.exports.signUp = (email, name, password) => {
  return new Promise((resolve, reject) => {

    // check arguments are valid
    if (!validator.isEmail(email))
      reject("invalid_email");
    if (name.trim().length == 0)
       reject("invalid_name");
    if (password.trim().length == 0)
      reject("invalid_password");

    // check no user with that mail already exists
    UserDb.findOne({email: email}).then(
      user => {
        if (user)
           reject("email_already_exists");

        // encrypt the password
        return encrypter.encrypt(password);
      }
    )

    // create a new user
    .then(encrypedPassword => {
      var user = new UserDb({
        email: email,
        name: name,
        password: encrypedPassword
      });
      return user.save();
    })

    // user created
    .then(user => {
        resolve(user.name);
      })
    .catch(
      err => {
        reject(err);
      }
    );

  });
}

module.exports.signIn = (email, password) => {
  return new Promise((resolve, reject) => {
    // check arguments are valid
    if (!validator.isEmail(email))
      reject("invalid_email");
    if (password.trim().length == 0)
      reject("invalid_password");

    // get the user with that email
    var foundUser;
    UserDb.findOne({email: email})
    .then(user => {
        // invalid email
        if (!user)
           reject("email_no_found");
        foundUser = user;

        // encrypt the password
        return encrypter.compare(password, user.password)
      })

      // check password is incorrect
      .then(equalPassword => {
        if(equalPassword)
          resolve(foundUser.name);
        else
          reject("wrong_password");
      })

      .catch(err => {
          reject(err);
        }
      );

  });
};

*/
/*
test
*/
/*
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/i-am-fine-user-test");

var mail = "test39@mail.com";
var password = "abc123";
var name = "hamada";

module.exports.signUp(mail, name, password)
.then(user => module.exports.signIn(mail, password))
.then(name => console.log(`got name ${name}`))
.catch(err =>  console.log(err));
*/
