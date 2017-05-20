const bcrypt = require('bcryptjs');

module.exports.encrypt = (str) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(2, (err, salt) => {
      if(err)
        reject(err);
      bcrypt.hash(str, salt, (err, hash) => {
        if(err)
          reject(err);
          resolve(hash);
      })
    });

  });
}

module.exports.compare = (str, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(str, hash, (err, res) => {
      if(err)
        reject(err)
      else
        resolve(res);
    })
  })
}

/*  Test */
/*
var pass = "abc123";
module.exports.encrypt(pass)
.then(hashed => {console.log(`hash ${hashed}`); return module.exports.compare(pass, hashed);})
.then(equal => console.log(`equal ? ${equal}`))
.catch(e => console.log(e));

*/
