const _ = require('lodash');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../index.js');
var mongoose = require('mongoose');
var {User} = require('./../model/user.js');
var encrypter = require('./../model/encrypter.js');

beforeEach((done) => {
  User.remove({})
  .then(() => {
    done();
  });
});

describe('search_user', () => {
  it('search_un_authorized1', (done) => {

    const expected =
    {
      ok: 0,
      error: "unauthorized"
    }
    request(app)
    .get("/search_user")
    .query({userName: "Hamada"})
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });

  });

  it('search_un_authorized2', (done) => {

    const token = "randomToken";
    const expected =
    {
      ok: 0,
      error: "unauthorized"
    }
    request(app)
    .get("/search_user")
    .query({token: token, userName: "hamada"})
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });

  });

  it('search_invalid_name', (done) => {

      const token = encrypter.idToJWT("123");
      const expected =
      {
        ok: 0,
        error: "invalid_user_name"
      }
      request(app)
      .get("/search_user")
      .query({token: token})
      .end((req, res) => {
        expect(res.body).toEqual(expected);
        done();
      });
    });

  it('search_empty_result', (done) => {

    var token = encrypter.idToJWT("123");
    var expected =
    {
      ok: 1,
      users: []
    };
    request(app)
    .get("/search_user")
    .query({token: token, userName: "not there"})
    .end((req, res) => {
      expect(res.body).toEqual(expected);
      done();
    });
  });

  it('search_one_result', (done) => {

    const token = encrypter.idToJWT("123");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "ahmed",
       lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
     });
    const expected =
    {
      ok: 1,
      users: [{id: "aaaaaaaaaaaaaaaaaaaaaaaa", name: "ahmed", email: "user1@mail.com", lastFineTime: "2017-05-23T20:00:00.000Z"}]
    };
    User.insertMany([user1])
    .then(() => {

        request(app)
        .get("/search_user")
        .query({token: token, userName: "ahmed"})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          done();
          });
    });

  });

  it('search_many_result', (done) => {

    const token = encrypter.idToJWT("123");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "ab",
       lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
     });
     const user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
       email: "user2@mail.com",
       name: "oooabcooo",
        lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
      });
      const user3 = new User({
        _id: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc'),
        email: "user3@mail.com",
        name: "abcooo",
         lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
       });
       const user4 = new User({
         _id: new mongoose.mongo.ObjectId('dddddddddddddddddddddddd'),
         email: "user4@mail.com",
         name: "aoo",
          lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
        });
    const expected =
    {
      ok: 1,
      users: [
        {id: "bbbbbbbbbbbbbbbbbbbbbbbb", name: "oooabcooo", email: "user2@mail.com", lastFineTime: "2017-05-23T20:00:00.000Z"},
        {id: "cccccccccccccccccccccccc", name: "abcooo", email: "user3@mail.com", lastFineTime: "2017-05-23T20:00:00.000Z"}
      ]
    };
    User.insertMany([user1, user2, user3, user4])
    .then(() => {

        request(app)
        .get("/search_user")
        .query({token: token, userName: "abc"})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          done();
          });
    })

    .catch(e => {
      console.log("failed to populate");
      console.log(e);
    });

  });

});
