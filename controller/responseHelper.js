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

module.exports.unAuthorizedResponse = (res) => module.exports.singleErrorResponse(res, "unauthorized");
