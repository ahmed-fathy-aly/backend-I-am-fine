const _ = require('lodash');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../index.js');
var {User} = require('./../model/user.js');
var SmartRec = require('./../model/smartRec.js');
var encrypter = require('./../model/encrypter.js');
var facebookHelper = require('./../model/FacebookHelper.js');
var mongoose = require('mongoose');

beforeEach((done) => {
  User.remove({})
  .then(() => {
    done();
  });
});

describe('recommend_users', () => {


  it('success_recommend', (done) => {
    const token = encrypter.idToJWT("123");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      email: "user1@mail.com",
      name: "user1",
      lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
     });
     const user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
       email: "user2@mail.com",
       name: "user2",
        lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
      });
      const user3 = new User({
        _id: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc'),
        email: "user3@mail.com",
        name: "user3",
         lastFineTime: new Date( new Date('2017-05-23T20:00:00'))
       });
       const expected =
       {
         ok: 1,
         users: [
           {id: "bbbbbbbbbbbbbbbbbbbbbbbb", name: "user2", email: "user2@mail.com", lastFineTime: "2017-05-23T20:00:00.000Z"},
           {id: "cccccccccccccccccccccccc", name: "user3", email: "user3@mail.com", lastFineTime: "2017-05-23T20:00:00.000Z"}
         ]
       };
       SmartRec.getSuggestedUsers = (userId, facebookToken) => {
         return new Promise((resolve, reject) => {
           resolve(['bbbbbbbbbbbbbbbbbbbbbbbb', 'cccccccccccccccccccccccc'])
         })
       }
       User.insertMany([user1, user2, user3])
         .then(() => {
             request(app)
             .get("/recommend_users")
             .query({token: token, facebookToken: "faceToken"})
             .end((req, res) => {
               expect(res.body).toEqual(expected);
               done();
               });
         })

  })
})
