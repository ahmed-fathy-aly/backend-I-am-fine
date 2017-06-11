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

describe('say_i_am_fine', () => {
  it('unauthorized', (done) => {

    const expected =
    {
      ok: 0,
      error: "unauthorized"
    }
    request(app)
    .post("/say_i_am_fine")
    .send({tok: "hamada"})
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
      error: "invalid_id"
    }
    request(app)
    .post("/say_i_am_fine")
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
      usersAsked: [new mongoose.mongo.ObjectId('111111111111111111111111'),
      new mongoose.mongo.ObjectId('222222222222222222222222')]
    });
    var user2 = new User({
       _id: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb')
      });
      var user3 = new User({
         _id: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc')
        });

    var askedAboutEntry1 = new WhoAsked({
        _id:  new mongoose.mongo.ObjectId('111111111111111111111111'),
        asker: new mongoose.mongo.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb')
      });
    var askedAboutEntry2 = new WhoAsked({
          _id:  new mongoose.mongo.ObjectId('222222222222222222222222'),
          asker: new mongoose.mongo.ObjectId('cccccccccccccccccccccccc')
      });

    const expected =
    {
      ok: 1
    };

    WhoAsked.insertMany([askedAboutEntry1, askedAboutEntry2])
    .then(() => {
      return User.insertMany([user1, user2, user3]);
    })

    .then(() => {

        request(app)
        .post("/say_i_am_fine")
        .send({token: token})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          User.findById("aaaaaaaaaaaaaaaaaaaaaaaa")
          .then(user => {
            expect(user.usersAsked).toEqual([]);
            return WhoAsked.find({});
          })
          .then(whoAsked => {
            expect(whoAsked).toEqual([]);
            done();
          })
        });
    })

  });

  it('successful2', (done) => {
    const token = encrypter.idToJWT("aaaaaaaaaaaaaaaaaaaaaaaa");
    const user1 = new User({
      _id: new mongoose.mongo.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
      usersAsked: []
    });

    const expected = {
      ok: 1
    };
    user1.save()
    .then(() => {

        request(app)
        .post("/say_i_am_fine")
        .send({token: token})
        .end((req, res) => {
          expect(res.body).toEqual(expected);
          User.findById("aaaaaaaaaaaaaaaaaaaaaaaa")
          .then(user => {
            expect(user.usersAsked).toEqual([]);
            return WhoAsked.find({});
          })
          .then(whoAsked => {
            expect(whoAsked).toEqual([]);
            done();
          })
        });
    })

  });
});
