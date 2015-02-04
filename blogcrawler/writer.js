var Writer = function(){};
var fs = require('fs'),
	cheerio = require('cheerio'),
	http = require('http');
Writer.prototype.writefile = function(object, html){
	var paths = [object.type, object.year + '-' + object.month, object.foldername],
		postPath = __dirname + '/' + paths.join('/'),//'/' + object.type + '/' + object.year + '-' + object.month + '/' + object.foldername,
		publicPath = postPath + '/public',
		imgPath = publicPath + '/img',
		$ = cheerio.load(html),
		imgs;
	console.log('Begin to write article', object.title);
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
			if(i === paths.length - 1){
				path = publicPath; 
				fs.mkdirSync(path);
				path = imgPath;
				fs.mkdirSync(path);
			}
		}
	}

	imgs = $('img');
	if(imgs.length > 0){
		imgs.each(function(index, value){
			console.log('Downloading file from', cheerio(value).attr('src'));
			var src = cheerio(value).attr('src'),
				file = fs.createWriteStream(imgPath + '/image' + index + '.jpg'),
				request = http.get(src, function(response){					
					// if(response.statusCode === 200){
					// 	console.log('Response Status Code:', response.statusCode);
					// 	return;
					// }
					if(response.statusCode === 200){						
						response.pipe(file);
					}
					else{
						console.log('Can\'t download the file. Response Status Code:', response.statusCode);
					}
					
					cheerio(value).attr('src', 'public/img/image' + index + '.jpg');
					if(index === imgs.length - 1){
						fs.writeFile(postPath + '/page.html', $.html(), function(err){
							if(err){
								return console.log(err);
							}
							console.log(postPath + '/page.html');
						});
					}
				}).on('error', function(){console.log('GET Request Error:', src)});
		});
	}
	else{
		fs.writeFile(postPath + '/page.html', $.html(), function(err){
			if(err){
				return console.log(err);
			}
			console.log(postPath + '/page.html');
		});
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
