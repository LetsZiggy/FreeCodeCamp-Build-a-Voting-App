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

  res.json({ "polls": polls });
});

router.post('/poll/id', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collection = await db.collection('build-a-voting-app-ids');
    let find = await collection.findOne(
      { type: 'polls' },
      { _id: 0, type: 0 }
    );
    let id = createID(find.list);
    let query = `list.${id}`;
    let update = await collection.findOneAndUpdate(
      { type: 'polls' },
      { $set: { [query]: new Date() } }
    );
    client.close();

    res.json({ "id": id });
  }
  else {
    res.end();
  }
});

router.post('/poll/create', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPolls = await db.collection('build-a-voting-app-polls');
    let insert = await collectionPolls.insertOne(req.body);
    let collectionIDs = await db.collection('build-a-voting-app-ids');
    let query = `list.${req.body.id}`;
    let update = await collectionIDs.findOneAndUpdate(
      { type: 'polls' },
      { $set: { [query]: 'created' } }
    );
    client.close();

    res.json(insert);
  }
  else {
    res.end();
  }
});

router.put('/poll/update/:id', async (req, res, next) => {
  if(req.cookies.id) {
    console.log(req.body);
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collection = await db.collection('build-a-voting-app-polls');
    let find = await collection.findOne({
      $and: [
        { id: { $eq: req.params.id } },
      ]
    });
    console.log(find);
    client.close();

    res.json({ result: 'test' });
  }
  else {
    res.end();
  }
});

module.exports = router;
