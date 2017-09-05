const _ = require('lodash');
const expect = require('expect');
const smartRec = require('../model/smartRec.js');
var {User} = require('./../model/user.js');
var FacebookHelper = require('./../model/FacebookHelper.js');

describe('smart_res', () => {
  var user1 = new User({facebookId: 'face1'});
  var user2 = new User({facebookId: 'face2'});
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


  it('recommends_users_asked', done => {

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

  it('recommends_facebook_friends', done => {

    FacebookHelper.getFriends = (facebookToken) => {
      return new Promise((resolve, reject) => {
        resolve(['face1', 'face2']);
      });
    }

    smartRec.getSuggestedUsers(user1._id, 'anyFacebookTok')
              .then(result => {
              expect(result).toEqual([user1._id, user2._id]);
              done();
            });
  });

  it('recommends_mix_facebook_and_suggested', done => {

    FacebookHelper.getFriends = (facebookToken) => {
      return new Promise((resolve, reject) => {
        resolve(['face1', 'face2']);
      });
    }

    smartRec.registerUserAsked(user4._id, user1._id)
            .then(() => {
              return smartRec.registerUserAsked(user3._id, user1._id);
            })
            .then(() => {
              return smartRec.getSuggestedUsers(user1._id, 'faceToken');
            })
            .then(result => {
              expect(result).toEqual([user3._id, user4._id, user1._id, user2._id]);
              done();
            });
  });
});
