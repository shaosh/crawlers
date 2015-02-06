var Writer = function(){};
var fs = require('fs'),
	pathUtil = require('path'),
	urlUtil = require('url'),
	cheerio = require('cheerio'),
	S = require('string'),
	async = require('async'),
	request = require('request');

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
	var paths = ['post', object.type, object.foldername + '.html'],
		postPath = __dirname + '/' + paths.join('/'),//'/' + object.type + '/' + object.year + '-' + object.month + '/' + object.foldername,
		publicPath = postPath + '/public',
		imgPath = publicPath + '/img',
		dasurl = 'http://www.designashirt.com',
		$ = cheerio.load(html),
		downloadTasks = [],
		createAssetDirectory,
		imgs;
	console.log('\t\t-> Begin to write post', object.title);

	for(var i = 0; i < paths.length; i++){
		var path = __dirname,
			pathExist;
		for(var j = 0; j <= i; j++){
			path += '/' + paths[j];
		}
		pathExist = fs.existsSync(path);
		if(!pathExist){
			fs.mkdirSync(path);
			if(i === paths.length - 1){
				(function(path, imgPath) {  // only create directory if needed
                    createAssetDirectory = function() {
                    	path = publicPath; 
						fs.mkdirSync(path);
						path = imgPath;
						fs.mkdirSync(path);
                    }
                })(path, imgPath);
			}
		}
	}

	imgs = $('img');
	if(imgs.length > 0){
		console.log('\t\t-> Found %d images', imgs.length);
		imgs.each(function(index, value){
			var $this = $(this),
				remoteUrl = $this.attr('src');
			if(!(/http/.test(remoteUrl))){
				remoteUrl = dasurl + remoteUrl;
			}
			
			var	remoteUrlParsed = urlUtil.parse(remoteUrl);

			var fileName = pathUtil.basename(remoteUrlParsed.pathname),
				destinationUrl = '/img/' + fileName,
				destination = pathUtil.join(imgPath, fileName);
			$this.attr('src', destinationUrl);
			console.log('\t\t\t-> Queuing image %s', remoteUrlParsed.href);
            downloadTasks.push(async.apply(downloadFile, remoteUrl, destination));
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
};
module.exports = new Writer();
