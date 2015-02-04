var Cacher = function () {};
var cache = require('memory-cache');
Cacher.prototype.cache = function(url, content, callback){
	cache.put(url, content);
	console.log('Cached contents in', url);
};
Cacher.prototype.fetch = function(url, callback){
	console.log('Fetched contents in', url);
	return cache.get(url);
};
module.exports = new Cacher();