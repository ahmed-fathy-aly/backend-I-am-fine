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
    var users = [new User({email: user1Email, name: user1Name, password: encrypted})];
    return User.insertMany(users);
  })

  .then((users) => {
    done();
  });

});

describe('sign_up', () => {
  it('sign_up_no_params', (done) => {

    request(app)
    .post("/sign_up")
    .send({})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual(["invalid_mail", "invalid_name", "invalid_password"]);
      done();
    });
  });

    it('sign_up_wrong_params', (done) => {

    request(app)
    .post("/sign_up")
    .send({email: "hamada", name: "", password: ""})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual(["invalid_mail", "invalid_name", "invalid_password"]);
      done();
    });
  });

  it('sign_up_duplicate', (done) => {

    request(app)
    .post("/sign_up")
    .send({email: user1Email, name: "any name", password: "any password"})
    .end((req, res) => {
      expect(res.body.ok).toEqual(0);
      expect(res.body.errors).toEqual("duplicate_mail");
      done();
    });
  });

  it('sign_up_success', (done) => {

    request(app)
    .post("/sign_up")
    .send({email: "test2@mail.com", name: "test2", password: "abc123"})
    .end((req, res) => {
      expect(res.body.ok).toEqual(1);
      User.findOne({email: "test2@mail.com"})
        .then(user => {
          expect(res.body.token).toEqual(encrypter.idToJWT(user._id.toString()));
          expect(res.body.id).toEqual(user._id.toString());
          expect(user.usersAsked).toEqual([]);
          expect(user.lastFineTime).toExist();
          done();
        });
    });
  });

});
