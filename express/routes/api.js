const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const createID = require('./services/create-id.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

router.get('/polls', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collection = await db.collection('build-a-voting-app-polls');
  let polls = await collection.find().project({ _id: 0 }).toArray();
  client.close();

  res.json({ polls: polls });
});

router.post('/poll/id', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collection = await db.collection('build-a-voting-app-ids');
    let ids = await collection.findOne(
      { type: 'polls' },
      { _id: 0, type: 0 }
    );
    let id = createID(ids.list);
    let query = `list.${id}`;
    let updated = await collection.findOneAndUpdate(
      { type: 'polls' },
      { $set: { [query]: new Date() } }
    );
    client.close();

    res.json({ id: id, create: true });
  }
  else {
    res.end({ id: null, create: false });
  }
});

router.post('/poll/create', async (req, res, next) => {
  if(req.cookies.id) {
    let query = `list.${req.body.id}`;
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPolls = await db.collection('build-a-voting-app-polls');
    let inserted = await collectionPolls.insertOne(req.body);
    let collectionIDs = await db.collection('build-a-voting-app-ids');
    let updated = await collectionIDs.findOneAndUpdate(
      { type: 'polls' },
      { $set: { [query]: 'created' } }
    );
    client.close();

    res.json({ create: true });
  }
  else {
    res.json({ create: false });
  }
});

router.put('/poll/update/:id', async (req, res, next) => {
  if(req.cookies.id) {
    let editedChoices = [];
    if(req.body.changes.editedChoices.length) {
      req.body.changes.editedChoices.forEach((v, i, a) => {
        editedChoices.push(
          { updateOne:
            { filter: { $and: [{ "id": { $eq: req.params.id } }, { "owner": { $eq: req.cookies.id } }, { "choices.id": v }] },
              update: { $set: { "choices.$.name": (req.body.poll.choices.find(fv => fv.id === v)).name } }
            }
          }
        );
      });
    }
    let newChoices = [];
    if(req.body.changes.newChoices.length) {
      let newChoicesArr = [];
      req.body.changes.newChoices.forEach((v, i, a) => {
        newChoicesArr.push(req.body.poll.choices.find(fv => fv.id === v));
      });

      newChoices.push(
        { updateOne:
          {
            filter: { $and: [{ id: { $eq: req.params.id } }, { owner: { $eq: req.cookies.id } }] },
            update: { $push: { choices: { $each: newChoicesArr } } }
          }
        }
      );
    }
    let deletedChoices = [];
    if(req.body.changes.deletedChoices.length) {
      let deletedChoicesArr = req.body.changes.deletedChoices.map((v, i, a) => v);

      deletedChoices.push(
        { updateOne:
          {
            filter: { $and: [{ id: { $eq: req.params.id } }, { owner: { $eq: req.cookies.id } }] },
            update: { $pull: { choices: { id: { $in: deletedChoicesArr } } } }
          }
        }
      );
    }
    let pollItems = [];
    if(req.body.changes.pollItems.length) {
      let pollItemsObj = {};
      req.body.changes.pollItems.forEach((v, i, a) => {
        pollItemsObj[v] = req.body.poll[v];
      });

      pollItems.push(
        { updateOne:
          {
            filter: { $and: [{ id: { $eq: req.params.id } }, { owner: { $eq: req.cookies.id } }] },
            update: { $set: pollItemsObj }
          }
        }
      );
    }

    let operations = [...editedChoices, ...newChoices, ...deletedChoices, ...pollItems];
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collection = await db.collection('build-a-voting-app-polls');
    let updated = await collection.bulkWrite(operations, { ordered: false });
    client.close();

    res.json({ update: true });
  }
  else {
    res.json({ update: false });
  }
});

router.delete('/poll/delete/:id', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPolls = await db.collection('build-a-voting-app-polls');
    let deleted = await collectionPolls.findOneAndDelete({ $and: [{ id: { $eq: req.params.id } }, { owner: { $eq: req.cookies.id } }] });
    client.close();

    res.json({ delete: true });
  }
  else {
    res.json({ delete: false });
  }
});

module.exports = router;
