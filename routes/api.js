var express = require('express');
var router = express.Router();
var stockModel = require('../db/stock');
router.route("/stock/:code").post(function(req, res, next) {//更新是否解决状态
	stockModel.update({code: req.params.code}, req.body, {upsert: true}, function(err) {
		if(err)
			return next(err);
		return res.json({messsage: "update successfully!"});
	});
}).delete(function(req, res) {
	stockModel.remove({code: req.params.code}, function(err, effectNum){
		if(err)
			return res.status(500).json({error: err});
		res.json({message: "remove successfully!"});
	});	
});
router.route("/query/:code").get(function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	//console.log(req.params.code);
	var url = "http://hq.sinajs.cn/list=" + req.params.code;
	var http = require('http');
	var BufferHelper = require('bufferhelper');
	var iconv = require('iconv-lite');
    http.get(url,function(sres){
      var bufferHelper = new BufferHelper();
      sres.on('data', function (chunk) {
        bufferHelper.concat(chunk);
      });
      sres.on('end',function(){ 
        var str = iconv.decode(bufferHelper.toBuffer(),'GBK');
        //str = str.substring(str.indexOf("\"")+1,str.lastIndexOf("\""));
        res.end(str);
      });
    });
});
router.route("/suggest/:code").get(function(req, res){
	var urlencode = require('urlencode');
	var url = "http://cjhq.baidu.com/suggest?code5=" + urlencode(req.params.code, "gbk");
	var http = require('http');
	var BufferHelper = require('bufferhelper');
	var iconv = require('iconv-lite');
    http.get(url,function(sres){
      var bufferHelper = new BufferHelper();
      sres.on('data', function (chunk) {
        bufferHelper.concat(chunk);
      });
      sres.on('end',function(){
        var str = iconv.decode(bufferHelper.toBuffer(),'GBK');
        res.json(JSON.parse(str));
      });
    });	
});
module.exports = router;