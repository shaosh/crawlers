var Writer = function(){};
var fs = require('fs'),
    pathUtil = require('path'),
    urlUtil = require('url'),
	cheerio = require('cheerio');

var S = require('string');
var async = require('async');
var request = require('request');

function downloadFile(remoteUrl, destination, callback) {
    console.log('\t\t\t-> Downloading file from %s', remoteUrl);
    fs.exists(destination, function(exists) {
        if (exists) {
            console.log('\t\t\t\t-> Download file %s already exists on disk', destination);
            return callback(null);
        }
        else {
            request(remoteUrl, callback).pipe(fs.createWriteStream(destination));
        }
    });
}

Writer.prototype.writefile = function(concurrency, object, html, callback){
	var paths = [object.type, object.year + '-' + S(object.month).padLeft(2, '0').s, object.foldername + '.html'],
		postPath = __dirname + '/' + paths.join('/'),//'/' + object.type + '/' + object.year + '-' + object.month + '/' + object.foldername,
		publicPath = postPath + '/public',
		imgPath = publicPath + '/img',
		$ = cheerio.load(html),
        downloadTasks = [],
        createAssetDirectory,
		imgs;
	console.log('\t\t-> Begin to write article', object.title);
	// fs.mkdir(postPath,
	// 	fs.writeFile(postPath + '/page.html', html,
	// 		function(err){
	// 			if(err){
	// 				return console.log(err);
	// 			}
	// 			console.log(postPath + '/page.html');
	// 		}
	// 	)
	// );
	// fs.mkdirSync(postPath + publicPath + imgPath);


	// var paths = ['/' + object.type, '/' + object.year + '-' + object.month],
	// 		filepath = paths.join();
	for(var i = 0; i < paths.length; i++){
		var path = __dirname,
			pathExist;
		for(var j = 0; j <= i; j++){
			path += '/' + paths[j];
		}
		pathExist = fs.existsSync(path);
		if(!pathExist){
			fs.mkdirSync(path);
			if(i === paths.length - 1){ // only create directory if needed
                (function(path, imgPath) {
                    createAssetDirectory = function() {
                        path = publicPath;
                        fs.mkdirSync(path);
                        path = imgPath;
                        fs.mkdirSync(path);
                    };
                })(path, imgPath);
			}
		}
	}

    imgs = $('img');
	if(imgs.length > 0){
        console.log('\t\t-> Found %d images', imgs.length);
		imgs.each(function(){
            var $this = $(this);
            var remoteUrl = $this.attr('src');
            var remoteUrlParsed = urlUtil.parse(remoteUrl);
            if (/\.squarespace\.com$/.test(remoteUrlParsed.host)) { // only download squarespace files, leave others (e.g. facebook.com) as-is
                var fileName = pathUtil.basename(remoteUrlParsed.pathname) + '.jpg';
                var destinationUrl = '/img/' + fileName;
                var destination = pathUtil.join(imgPath, fileName);
                $this.attr('src', destinationUrl);
                console.log('\t\t\t-> Queuing image %s', remoteUrlParsed.href);
                downloadTasks.push(async.apply(downloadFile, remoteUrl, destination));
            }
            else {
                console.log('\t\t\t-> Ignoring image %s', remoteUrlParsed.href);
            }
		});
	}

    function saveCurrentPage(saveCallback) {
		fs.writeFile(postPath + '/page.html', $.html(), function(err){
			if(err){
				return saveCallback(err);
			}
			console.log('\t\t-> ' + postPath + '/page.html');
            saveCallback(null);
		});
    }

    if (downloadTasks.length) {
        createAssetDirectory();
        async.parallelLimit(downloadTasks, concurrency || 2, function(err) {
            if (err) throw err;
            saveCurrentPage(callback);
        });
    }
    else {
        saveCurrentPage(callback);
    }

	// fs.writeFile(postPath + '/page.html', $.html(), function(err){
	// 	if(err){
	// 		return console.log(err);
	// 	}
	// 	console.log(postPath + '/page.html');
	// });


	// async.series([
	// 	function(callback){
	// 		imgs = $('img');
	// 		imgs.each(function(index, value){
	// 			var src = cheerio(value).attr('src'),
	// 				file = fs.createWriteStream(imgPath + '/image' + index + '.jpg'),
	// 				request = http.get(src, function(response){
	// 					response.pipe(file);
	// 					console.log('Before: ', cheerio(value).attr('src'));
	// 					cheerio(value).attr('src', '/public/image' + index + '.jpg');
	// 					console.log('After: ', cheerio(value).attr('src'));
	// 				});
	// 		});
	// 		callback(null, 'Images are downloaded');
	// 	},
	// 	function(callback){
	// 		fs.writeFile(postPath + '/page.html', $.html(), function(err){
	// 			if(err){
	// 				return console.log(err);
	// 			}
	// 			console.log(postPath + '/page.html');
	// 		});
	// 		callback(null, 'Files are created');
	// 	}],
	// 	function(err, results){
	// 		console.log(results);
	// 	}
	// );
};
module.exports = new Writer();
