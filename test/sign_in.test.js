const _ = require('lodash');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../index.js');
var {User} = require('./../model/user.js');
var encrypter = require('./../model/encrypter.js');


var user1Password = "abc123";
var user1Email = "test1@mail.com";
var user1Name = "test1";

beforeEach((done) => {
  User.remove({})
  .then(()=> {
    return encrypter.encrypt(user1Password)
  })

  .then(encrypted => {
    var user1 = new User({email: user1Email, name: user1Name, password: encrypted});
    return User.insertMany([user1]);
  })

  .then((users) => {
    done();
  });

});


describe('sign_in', () => {
  it('sign_in_no_params', (done) => {

    request(app)
    .post("/sign_in")
    .send({})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual(["invalid_mail", "invalid_password"]);
      done();
    });
  });

  it('sign_in_wrong_params', (done) => {

    request(app)
    .post("/sign_in")
    .send({email: "invalid mail",  password: ""})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual(["invalid_mail", "invalid_password"]);
      done();
    });
  });

  it('sign_in_not_found_mail', (done) => {

    request(app)
    .post("/sign_in")
    .send({email: "not_found@mail.com",  password: user1Password})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual(["email_not_found"]);
      done();
    });
  });

  it('sign_in_success', (done) => {

    request(app)
    .post("/sign_in")
    .send({email: user1Email,  password: user1Password})
    .end((req, res) => {
      expect(res.body.ok).toEqual(1);
      User.findOne({email: user1Email})
        .then(user => {
          expect(res.body.token).toEqual(encrypter.idToJWT(user._id.toString()));
          done();
        })
    });
  });

  it('sign_in_fail', (done) => {
    var email = "test1@mail.com";
    var password = "wrong pass";

    request(app)
    .post("/sign_in")
    .send({email,  password})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual("wrong_password");
      done();
    });
  });

});
