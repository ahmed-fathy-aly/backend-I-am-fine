const _ = require('lodash');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../index.js');
var {User} = require('./../model/user.js');
var encrypter = require('./../model/encrypter.js');
var mongoose = require('mongoose');


var user1Password = "abc123";
var user1Email = "test1@mail.com";
var user1Name = "test1";

beforeEach((done) => {
  User.remove({})
  .then(() => {
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

    const expected = {
      ok: 1,
      id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      token: encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa")
    }
    encrypter.encrypt(user1Password)
    .then(encrypted => {
      const user1 = new User({
        _id: new mongoose.mongo.ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"),
        email: user1Email,
        name: user1Name,
        password: encrypted
      });
      return user1.save();
    })

    .then(() => {
      request(app)
      .post("/sign_in")
      .send({email: user1Email,  password: user1Password, notificationToken: 'notToken'})
      .end((req, res) => {
        expect(res.body).toEqual(expected);
        User.findById(res.body.id).then(user => {
          expect(user.notificationToken).toEqual("notToken");
          done();
        });
      });
    })

    .catch(e => {
      console.log(e);
    });
  });

  it('wrong_pass', (done) => {

    const expected = {
      ok: 0,
      errors: ["wrong_password"]
    };
    const user1 = new User({
        email: user1Email,
        name: user1Name,
        password: "right pass"
      });

    user1.save()
    .then(() => {
      request(app)
      .post("/sign_in")
      .send({email: user1Email,  password: "wrong pass"})
      .end((req, res) => {
        expect(res.body).toEqual(expected);
        done();
      });
    });
  });


});
