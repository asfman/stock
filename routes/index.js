var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Hello Vue.js' });
});

router.get('/test', function(req, res) {
  res.render('test', { title: 'Hello Vue.js' });
});

module.exports = router;
