var express = require('express');
var router = express.Router();
var path = require('path');

/*
**
** GET frontend files
**
*/

router.get('/scripts/app-bundle.js.map', function(req, res, next) {
  // Path to be changed on deployment
  res.sendFile(path.join(__dirname, '../../aurelia/scripts/app-bundle.js.map'));
});

router.get('/scripts/app-bundle.js', function(req, res, next) {
  // Path to be changed on deployment
  res.sendFile(path.join(__dirname, '../../aurelia/scripts/app-bundle.js'));
});

router.get('/scripts/vendor-bundle.js', function(req, res, next) {
  // Path to be changed on deployment
  res.sendFile(path.join(__dirname, '../../aurelia/scripts/vendor-bundle.js'));
});

router.get('/scripts/style.css', function(req, res, next) {
  // Path to be changed on deployment
  res.sendFile(path.join(__dirname, '../../aurelia/scripts/style.css'));
});

router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
