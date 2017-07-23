const _ = require('lodash');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../index.js');
var {User} = require('./../model/user.js');
var encrypter = require('./../model/encrypter.js');
var facebookHelper = require('./../model/FacebookHelper.js');
var mongoose = require('mongoose');

beforeEach((done) => {
  User.remove({})
  .then(() => {
    done();
  });
});


describe('facebook', () => {
  it('success_new_user', (done) => {

    mockFacebookHelper({
      'ok': 1,
      'facebookId': 'faceId',
      'name': 'ahmed',
      'profilePicture' : 'ahmedPP'
    });
    request(app)
    .post("/facebook_authenticate")
    .send({facebookToken: "faceTok", notificationToken: 'notToken'})
    .end((req, res) => {
      expect(res.body.ok).toEqual(1);
      User.findOne({facebookId: 'faceId'})
        .then(user => {
          expect(res.body.token).toEqual(encrypter.idToJWT(user._id.toString()));
          expect(res.body.id).toEqual(user._id.toString());
          expect(user.usersAsked).toEqual([]);
          expect(user.lastFineTime).toExist();
          expect(user.notificationToken).toEqual('notToken');
          expect(user.name).toEqual('ahmed');
          expect(user.profilePicture).toEqual('ahmedPP');
          done();
        });
    });
  });

  it('success_existing_user', (done) => {
    const expected = {
      ok: 1,
      id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      token: encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa")
    }
    const user = new User({
      _id: new mongoose.mongo.ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"),
      facebookId: 'faceId'
    });
    mockFacebookHelper({
      'ok': 1,
      'facebookId': 'faceId'
    });

    user.save()
    .then(() => {
      request(app)
      .post("/facebook_authenticate")
      .send({facebookToken: "faceTok", notificationToken: 'notToken'})
      .end((req, res) => {
        expect(res.body.ok).toEqual(1);
        User.findById("aaaaaaaaaaaaaaaaaaaaaaaa")
          .then(user => {
            expect(user.notificationToken).toEqual('notToken');
            done();
          });
      });
    });
  });

  it('fail_bad_token', (done) => {
    const expected = {
      ok: 0,
      error: 'invalid_token'
    }
    mockFacebookHelper({
      'ok': 0,
      'error': 'ay bta3'
    });
    request(app)
    .post("/facebook_authenticate")
    .send({facebookToken: "faceTok", notificationToken: 'notToken'})
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });
  });


  function mockFacebookHelper(data) {
      facebookHelper.authenticateToken = (token) => {
        return new Promise((resolve, reject) => {
          resolve(data);
        });
      }
  }

});
