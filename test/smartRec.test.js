const _ = require('lodash');
const expect = require('expect');
const smartRec = require('../model/smartRec.js');
var {User} = require('./../model/user.js');

describe('smart_res', () => {
  var user1 = new User();
  var user2 = new User();
  var user3 = new User();
  var user4 = new User();

  beforeEach((done) => {
    User.remove({})
    .then(() => {
        return User.insertMany([user1, user2, user3, user4]);
    })
    .then(() => {
      done();
    });
  });


  it.only('recommends_success', done => {

    smartRec.registerUserAsked(user2._id, user1._id)
            .then(() => {
              return smartRec.registerUserAsked(user3._id, user1._id);
            })
            .then(() => {
              return smartRec.registerUserAsked(user4._id, user1._id);
            })
            .then(() => {
              return smartRec.registerUserAsked(user2._id, user1._id);
            })
            .then(() => {
              return smartRec.getSuggestedUsers(user1._id);
            })
            .then(result => {
              expect(result).toEqual([user2._id, user4._id, user3._id]);
              done();
            });
  });
});
