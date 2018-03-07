var express = require('express');
var router = express.Router();

/* GET polls */
router.get('/polls', function(req, res, next) {
  console.log('request polls');
  res.json(
    {
      "polls": [
        {
          "id": 'b2',
          "name": 'poll-2',
          "owner": 'a2',
          "created": 2,
          "edited": 2,
          "isPublic": false,
          "lastIndex": 2,
          "voters": {
          },
          "choices": [
            {
              "id": 1,
              "name": '01',
              "votes": 4,
            },
            {
              "id": 2,
              "name": '02',
              "votes": 13,
            }
          ]
        }
      ]
    }
  );
  res.end();
});

module.exports = router;
