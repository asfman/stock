var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Hello Vue.js' });
});

router.get('/test', function(req, res) {
  res.render('test', { title: 'Hello Vue.js' });
});

router.get('/asfman', function(req, res){
	res.render('asfman', { title: 'Hello asfman' });
});

router.get('/wjd', function(req, res) {
	var url = "http://iguba.eastmoney.com/action.aspx?action=getuserreply&uid=2923094077285486&rnd=" + new Date().getTime();
	var fetch = require('node-fetch');
	fetch(url)
	.then(function(res) {
        return res.json();
    }).then(function(json) {
        res.render('wujiandao', json);
    });	
});

module.exports = router;
