const _ = require('lodash');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../index.js');
var mongoose = require('mongoose');
var {User, WhoAsked} = require('./../model/user.js');
var encrypter = require('./../model/encrypter.js');

beforeEach((done) => {
  User.remove({})

  .then(() => {
    return WhoAsked.remove({});
  })

  .then(() => {
    done();
  });
});

describe('ask_about_user', () => {
  it('unauthorized', (done) => {

    const expected =
    {
      ok: 0,
      error: "unauthorized"
    }
    request(app)
    .post("/ask_about_user")
    .send({userId: "aaaaaaaaaaaaaaaaaaaaaaaa"})
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });
  });

  it('invalid_user_id', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");
    const expected =
    {
      ok: 0,
      error: "invalid_user_id"
    }
    request(app)
    .post("/ask_about_user")
    .send({token: token, userId: "bbbbbbbbbbbbbbbbbbbbbbbb"})
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });
  });

  it('successful1', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "user1"
    });
     const user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
       email: "user2@mail.com",
       name: "user2"
      });

    const expected =
    {
      ok: 1
    };
    User.insertMany([user1, user2])
    .then(() => {

        request(app)
        .post("/ask_about_user")
        .send({token: token, userId: "bbbbbbbbbbbbbbbbbbbbbbbb"})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          User.findById("bbbbbbbbbbbbbbbbbbbbbbbb")
          .populate({
              path: 'usersAsked',
              populate: {path: 'asker'}
          })
          .then(user => {
            expect(user.usersAsked.length).toEqual(1);
            expect(user.usersAsked[0].asker.id).toEqual("aaaaaaaaaaaaaaaaaaaaaaaa");
            done();
          })
          });
    });

  });

  it('successful2', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "user1"
    });
    var user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
       email: "user2@mail.com",
       name: "user2",
       usersAsked: [new mongoose.mongo.ObjectId('111111111111111111111111')]
      });
    var askedAboutEntry = new WhoAsked({
        _id:  new mongoose.mongo.ObjectId('111111111111111111111111'),
        asker: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
        askTime: new Date()
      });

    const expected =
    {
      ok: 1
    };

    WhoAsked.insertMany(askedAboutEntry)
    .then(() => {
      return User.insertMany([user1, user2]);
    })

    .then(() => {

        request(app)
        .post("/ask_about_user")
        .send({token: token, userId: "bbbbbbbbbbbbbbbbbbbbbbbb"})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          User.findById("bbbbbbbbbbbbbbbbbbbbbbbb")
          .populate({
              path: 'usersAsked',
              populate: {path: 'asker'}
          })
          .then(user => {
            expect(user.usersAsked.length).toEqual(1);
            expect(user.usersAsked[0].asker.id).toEqual("aaaaaaaaaaaaaaaaaaaaaaaa");
            done();
          })
          });
    });

  });

  it('successful3', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "user1"
    });
    var user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
       email: "user2@mail.com",
       name: "user2",
       usersAsked: [new mongoose.mongo.ObjectId('111111111111111111111111')]
      });
      var user3 = new User({
         _id: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc'),
         email: "user3@mail.com",
         name: "user3"
        });

    var askedAboutEntry = new WhoAsked({
        _id:  new mongoose.mongo.ObjectId('111111111111111111111111'),
        asker: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc'),
        askTime: new Date()
      });

    const expected =
    {
      ok: 1
    };

    WhoAsked.insertMany(askedAboutEntry)
    .then(() => {
      return User.insertMany([user1, user2, user3]);
    })

    .then(() => {

        request(app)
        .post("/ask_about_user")
        .send({token: token, userId: "bbbbbbbbbbbbbbbbbbbbbbbb"})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          User.findById("bbbbbbbbbbbbbbbbbbbbbbbb")
          .populate({
              path: 'usersAsked',
              populate: {path: 'asker'}
          })
          .then(user => {
            expect(user.usersAsked.length).toEqual(2);
            expect(user.usersAsked[0].asker.id).toEqual("cccccccccccccccccccccccc");
            expect(user.usersAsked[1].asker.id).toEqual("aaaaaaaaaaaaaaaaaaaaaaaa");
            done();
          })
          });
    });

  });
});
