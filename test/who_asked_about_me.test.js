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


describe('who_asked_about_me', () => {
  it('unauthorized', (done) => {

    const expected =
    {
      ok: 0,
      errors: ["unauthorized"]
    }
    request(app)
    .get("/who_asked_about_me")
    .send()
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });
  });

  it('invalid_id', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");

    const expected =
    {
      ok: 0,
      errors: "invalid_id"
    };

    request(app)
    .get("/who_asked_about_me")
    .send({token: token})
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
      name: "user1",
      usersAsked: [new mongoose.mongo.ObjectId('111111111111111111111111'),
      new mongoose.mongo.ObjectId('222222222222222222222222')]
    });
    var user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
       email: "user2@mail.com",
       name: "user2"
      });
      var user3 = new User({
         _id: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc'),
         email: "user3@mail.com",
         name: "user3"
        });

    var askedAboutEntry1 = new WhoAsked({
        _id:  new mongoose.mongo.ObjectId('111111111111111111111111'),
        asker: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
        askTime: new Date("2017-05-23T20:00:00.000Z")
      });
    var askedAboutEntry2 = new WhoAsked({
          _id:  new mongoose.mongo.ObjectId('222222222222222222222222'),
          asker: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc'),
          askTime: new Date("2017-06-23T20:00:00.000Z")
      });


    const expected =
    {
      ok: 1,
      whoAsked: [
        {
          email: "user2@mail.com",
          id: "bbbbbbbbbbbbbbbbbbbbbbbb",
          name: "user2",
          askTime: "2017-05-23T20:00:00.000Z"
        },
        {
          email: "user3@mail.com",
          id: "cccccccccccccccccccccccc",
          name: "user3",
          askTime: "2017-06-23T20:00:00.000Z"
        }
      ]
    };

    WhoAsked.insertMany([askedAboutEntry1, askedAboutEntry2])
    .then(() => {
      return User.insertMany([user1, user2, user3]);
    })

    .then(() => {

        request(app)
        .get("/who_asked_about_me")
        .send({token: token})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          done();
          });
    });

  });

  it('successful2', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "user1",
      usersAsked: [new mongoose.mongo.ObjectId('111111111111111111111111'),
      new mongoose.mongo.ObjectId('222222222222222222222222')]
    });

    const expected =
    {
      ok: 1,
      whoAsked: []
    };


    User.insertMany([user1]).then(() => {

        request(app)
        .get("/who_asked_about_me")
        .send({token: token})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          done();
          });
    });

  });

});
