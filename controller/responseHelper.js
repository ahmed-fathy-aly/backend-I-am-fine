var encrypter = require('./../model/encrypter.js');

module.exports.multipleErrorResponse  = (res, errors) => {
  res.send({
    ok: 0,
    errors: errors
  });
}

module.exports.singleErrorResponse = (res, error) => {
  res.send({
    ok: 0,
    error: error
  });
}

module.exports.unAuthorizedResponse = (res) =>
  module.exports.singleErrorResponse(res, "unauthorized");

module.exports.unknownErrorResponse = (res, e) => {
  console.log("Unknown error !");
  console.log(e);
  return res.status(400).send({
    unknown_error: e
  });
}

module.exports.authorizeRequest = (req, res) => {
  return new Promise((resolve, reject) => {
    const token = req.body.token || req.query.token;
    if(!token) {
        return module.exports.unAuthorizedResponse(res);
    }

    encrypter.JWTToId(token)
    .then(id => {
      resolve(id);
    }, err => {
        module.exports.unAuthorizedResponse(res);
    })
  });
}
