var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto');

var mkdirp = require('mkdirp');

var cacheDir = './.cache';
mkdirp.sync(cacheDir);

var cache = {
    cachePath: function hash(str) {
        return path.join(cacheDir, crypto.createHash('sha1').update(str).digest('hex'));
    },

    put: function(urlPath, data, callback) {
        var cachePath = cache.cachePath(urlPath);
        fs.writeFile(cachePath, JSON.stringify(data), callback);
    },

    get: function(urlPath, callback) {
        var cachePath = cache.cachePath(urlPath);
        fs.exists(cachePath, function(exists) {
            if (exists) {
                fs.readFile(cachePath, function(err, data) {
                    if (err) return callback(err);
                    callback(null, JSON.parse(data));
                });
            }
            else {
                callback(null);
            }
        });
    }
};

module.exports = cache;