const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const createID = require('./services/create-id.js');
const handlePassword = require('./services/handle-password.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

router.get('/polls', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionPolls = await db.collection('build-a-voting-app-polls');
  let findPoll = await collectionPolls.find().project({ _id: 0 }).toArray();
  client.close();

  res.json({ get: true, polls: findPoll });
});

router.post('/poll/id', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('build-a-voting-app-ids');
    let findID = await collectionIDs.findOne({ type: 'polls' }, { _id: 0, type: 0 });
    let id = createID(findID.list);
    let query = `list.${id}`;
    let updateID = await collectionIDs.findOneAndUpdate(
      { type: 'polls' },
      { $set: { [query]: new Date() } }
    );
    client.close();

    res.json({ create: true, id: id });
  }
  else {
    res.json({ create: false, id: null });
  }
});

router.post('/poll/create', async (req, res, next) => {
  if(req.cookies.id) {
    let query = `list.${req.body.id}`;
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPolls = await db.collection('build-a-voting-app-polls');
    let insertPoll = await collectionPolls.insertOne(req.body);
    let collectionIDs = await db.collection('build-a-voting-app-ids');
    let updateID = await collectionIDs.findOneAndUpdate({ type: 'polls' }, { $set: { [query]: 'created' } });
    client.close();

    res.json({ create: true });
  }
  else {
    res.json({ create: false });
  }
});

router.put('/poll/update/:id', async (req, res, next) => {
  if(req.cookies.id) {
    let operations = [];

    if(req.body.changes.editedChoices.length) {
      req.body.changes.editedChoices.forEach((v, i, a) => {
        operations.push(
          { updateOne:
            { filter: { $and: [{ id: req.params.id }, { owner: req.cookies.id }, { "choices.id": v }] },
              update: { $set: { "choices.$.name": (req.body.poll.choices.find(fv => fv.id === v)).name } }
            }
          }
        );
      });
    }

    if(req.body.changes.newChoices.length) {
      let newChoicesList = [];
      req.body.changes.newChoices.forEach((v, i, a) => {
        newChoicesList.push(req.body.poll.choices.find(fv => fv.id === v));
      });

      operations.push(
        { updateOne:
          {
            filter: { $and: [{ id: req.params.id }, { owner: req.cookies.id }] },
            update: { $push: { choices: { $each: newChoicesList } } }
          }
        }
      );
    }

    if(req.body.changes.deletedChoices.length) {
      let deletedChoicesList = req.body.changes.deletedChoices.map((v, i, a) => v);

      operations.push(
        { updateOne:
          {
            filter: { $and: [{ id: req.params.id }, { owner: req.cookies.id }] },
            update: { $pull: { choices: { id: { $in: deletedChoicesList } } } }
          }
        }
      );
    }

    if(req.body.changes.pollItems.length) {
      let pollItemsList = {};
      req.body.changes.pollItems.forEach((v, i, a) => {
        pollItemsList[v] = req.body.poll[v];
      });

      operations.push(
        { updateOne:
          {
            filter: { $and: [{ id: req.params.id }, { owner: req.cookies.id }] },
            update: { $set: pollItemsList }
          }
        }
      );
    }

    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPolls = await db.collection('build-a-voting-app-polls');
    let bulkUpdatePoll = await collectionPolls.bulkWrite(operations, { ordered: false });
    client.close();

    res.json({ update: true });
  }
  else {
    res.json({ update: false });
  }
});

router.delete('/poll/delete/:id', async (req, res, next) => {
  if(req.cookies.id) {
    let query = `list.${req.params.id}`;
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPolls = await db.collection('build-a-voting-app-polls');
    let deletePoll = await collectionPolls.findOneAndDelete({ $and: [{ id: req.params.id }, { owner: req.cookies.id }] });
    let collectionIDs = await db.collection('build-a-voting-app-ids');
    let deleteId = await collectionIDs.updateOne({ type: 'polls' }, { $unset: { [query]: '' } });
    client.close();

    res.json({ delete: true });
  }
  else {
    res.json({ delete: false });
  }
});

router.put('/poll/vote/:id', async (req, res, next) => {
  let operations = [];
  if(req.body.username !== null) {
    let query = `voters.${req.body.username}`;
    operations.push(
      { updateOne:
        {
          filter: { id: req.params.id },
          update: { $set: { [query]: req.body.votes[0] } }
        }
      }
    );

    if(req.body.votes[1]) {
      operations.push(
        { updateOne:
          {
            filter: { $and: [{ id: req.params.id }, { "choices.id": req.body.votes[1] }] },
            update: { $inc: { "choices.$.votes": -1 } }
          }
        }
      );
    }
  }

  operations.push(
    { updateOne:
      {
        filter: { $and: [{ id: req.params.id }, { "choices.id": req.body.votes[0] }] },
        update: { $inc: { "choices.$.votes": 1 } }
      }
    }
  );

  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionPolls = await db.collection('build-a-voting-app-polls');
  let bulkUpdatePoll = await collectionPolls.bulkWrite(operations, { ordered: false });
  client.close();

  res.json({ update: true });
});

router.post('/user/checkname', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('build-a-voting-app-ids');
  let findID = await collectionIDs.findOne({ type: 'users' }, { _id: 0, type: 0 });
  client.close();

  let takenUsernames = Object.entries(findID).map((v, i, a) => v[1]);
  if(takenUsernames.indexOf(req.body.username) === -1) {
    res.json({ taken: false });
  }
  else {
    res.json({ taken: true });
  }
});

router.post('/user/create', async (req, res, next) => {
  if(!req.cookies.id) {
    let data = handlePassword(req.body.password);
    data.username = req.body.username;

    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('build-a-voting-app-ids');
    let findID = await collectionIDs.findOne({ type: 'users' }, { _id: 0, type: 0 });
    let id = createID(findID.list);
    data.id = id;
    let query = `list.${id}`;
    let insertID = await collectionIDs.findOneAndUpdate(
      { type: 'users' },
      { $set: { [query]: req.body.username } }
    );
    let collectionUsers = await db.collection('build-a-voting-app-users');
    let insertUser = await collectionUsers.insertOne(data);
    client.close();

    let date = new Date();
    date.setDate(date.getDate() + 1);
    res.cookie('id', id, { expires: date, path: '/', httpOnly: true });
    // res.cookie('id', id, { expires: date, path: '/', httpOnly: true, secure: true });

    res.json({ create: true, expire: (Date.now() + 86400000) });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ create: false });
  }
});

router.post('/user/login', async (req, res, next) => {
  if(!req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('build-a-voting-app-users');
    let findUser = await collectionUsers.findOne({ username: req.body.username });
    client.close();

    if(!findUser) {
      res.json({ get: false });
    }
    else {
      let data = await handlePassword(req.body.password, findUser.salt);

      if(data.hash !== findUser.hash) {
        res.json({ get: false }); 
      }
      else {
        let date = new Date();
        date.setDate(date.getDate() + 1);
        res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true });
        // res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true, secure: true });
        res.json({ get: true, expire: (Date.now() + 86400000) });
      }
    }
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ get: false });
  }
});

router.post('/user/logout', async (req, res, next) => {
  res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
  // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
  res.json({ logout: true });
});

router.post('/user/edit', async (req, res, next) => {
  if(!req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('build-a-voting-app-users');
    let findUser = await collectionUsers.findOne({ username: req.body.username });

    if(!findUser) {
      client.close();
      res.json({ update: false });
    }
    else {
      let data = await handlePassword(req.body.password);
      let updateUser = await collectionUsers.updateOne({ username: req.body.username }, { $set: { hash: data.hash, salt: data.salt } });
      client.close();

      let date = new Date();
      date.setDate(date.getDate() + 1);
      res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true });
      // res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true, secure: true });
      res.json({ update: true, expire: (Date.now() + 86400000) });
    }
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ update: false });
  }
});

module.exports = router;