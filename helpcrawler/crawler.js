var Crawler = function () {};
var http = require('http');
	request = require('request');
Crawler.prototype.get=function(url,callback){
	request({url:url, headers: {'User-Agent': 'request'}}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(body,response.statusCode);
		}
		else{
			console.log(error,response.statusCode);
		}
	})
};
module.exports = new Crawler();