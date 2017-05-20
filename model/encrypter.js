const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports.idToJWT = (id) => {
    var json = {id: id};
    return jwt.sign(json, process.env.SECRET_KEY);
}

module.exports.JWTToId = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, res) => {
      if(err)
        reject(err);
      else
        resolve(res.id);
    })
  });
}


/*  Test */
/*
var pass = "abc123";
module.exports.encrypt(pass)
.then(hashed => {console.log(`hash ${hashed}`); return module.exports.compare(pass, hashed);})
.then(equal => console.log(`equal ? ${equal}`))
.catch(e => console.log(e));
*/

/*
process.env.SECRET_KEY = "hamada";
var id = "abc";
var token = module.exports.idToJWT(id);
console.log(`token ${token}`);

module.exports.JWTToId(token)
.then(id => console.log(`id ${id}`))
.catch(e => console.log(`error ${e}`));
*/
