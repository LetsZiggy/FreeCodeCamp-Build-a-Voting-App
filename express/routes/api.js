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
    let result = await collection.findOne(
      { type: 'polls' },
      { _id: 0, type: 0 }
    );
    let id = await createID(result.list);
    let write = await collection.update(
      { type: 'polls' },
      { $push: { list: [ id, Date.now() ]}},
      { update: true }
    );
    client.close();

    res.json({ "id": id });
  }
  else {
    res.end();
  }
});

module.exports = router;
