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

  if(!req.cookies.id) {
    res.cookie('id', 'exampleuser1', { maxAge: 86400000, path: '/', httpOnly: true });
  }

  res.json({ polls: findPoll });
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

    res.json({ id: id, create: true });
  }
  else {
    res.json({ id: null, create: false });
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
  if(req.cookies.id) {
    let query = `voters.${req.cookies.id}`;
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

// router.post('user/username', async (req, res, next) => {

// });
/*
router.post('/user/login', async (req, res, next) => {

});

router.post('/user/logout', async (req, res, next) => {

});

router.post('/user/new', async (req, res, next) => {

});

router.post('/user/edit', async (req, res, next) => {

});
*/
module.exports = router;

// res.cookie('id', 'exampleuser1', { maxAge: 86400000, path: '/', httpOnly: true, secure: true });