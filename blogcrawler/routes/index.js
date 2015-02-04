
/*
 * GET home page.
 */

var crawler = require('../crawler.js'),
	cacher = require('../cacher.js'),
	parser = require('../parser.js'),
	composer = require('../composer.js'),
	writer = require('../writer.js'),
	cheerio = require('cheerio');

var urlList = [];

// var jsdom = require("jsdom");
// var window = jsdom.jsdom().parentWindow;
// var $ = require('jquery')(window);
// var photos = [],
// 	blogs = [];
// var parsePhotos = function(content){
// 	var $content = $(content),
// 		articles = $content.find

// };

exports.index = function(req, res){
	var bases = ['http://photos.designashirt.com', 'http://blog.designashirt.com'],
		base = bases[0],
		url = base,
		count = 0;
	// var crawl = function(url){
	// 	crawler.get(url,function(content,status){
	// 		console.log("status:="+status);
	// 		var $ = cheerio.load(content),
	// 			next = $('#nextLink').attr('href');
	// 		console.log(next);
	// 		if(!!next){
	// 			url = base + next;
	// 		}
	// 		else if(count < bases.length - 1){
	// 			count++;
	// 			base = bases[count];
	// 			url = base;
	// 		}
	// 		else{
	// 			url = null;
	// 		}
	// 		cacher.cache(url, content);
	// 		console.log(url, count);
	// 	});	
	// };

	// var parse = function(){};

	// var crawlSqs = function(){
	// 	async.whilst(
	// 		function(){console.log('flag', url !== null);return url !== null;},
	// 		function(){crawl(url, count);console.log('url', url); },
	// 		function(){console.log('Crawling Blog and Photos are done!')}
	// 	);
	// };

	// crawlSqs();

	var crawl = function(url){
		urlList.push(url);
		crawler.get(url,function(content,status){
			console.log("status:", status);
			console.log('url',url);
			cacher.cache(url, content);
			var $ = cheerio.load(content),
				next = $('#nextLink').attr('href');
			if(!!next){
				url = base + next;
			}
			else if(count < bases.length - 1){
				count++
				base = bases[count];
				url = base;
			}
			else{
				url = null;
			}
			if(!!url){				
				crawl(url);		
			}
			else{
				console.log('urlList', urlList);
				parse();
				return;
			}			
			// res.send(content);
		});	
	};

	var parse = function(){
		urlList.forEach(function(value, index){
			var content = cacher.fetch(value),
				$ = cheerio.load(content),
				articles = $('article'),
				type;
			if(/photos.designashirt.com/.test(value)){
				type = 'photo';
			}
			else{
				type = 'blog';
			}
			articles.each(function(index, value){
				var obj = parser.parse(value),
					html;
				obj.type = type;
				// console.log('obj',obj);
				html = composer.compose(obj);
				// console.log('html', html);				
				writer.writefile(obj, html);
			});
		});
	};

	// var writefile = function(object, html){
	// 	var postPath = '/' + object.type + '/' + object.year + '-' + object.month + '/' + object.filename,
	// 		publicPath = '/public/img';
	// 	fs.mkdirSync(publicPath);
	// 	fs.writeFile(postPath + '/page.html', html, function(err){
	// 		if(err){
	// 			return console.log(err);
	// 		}
	// 		console.log(postPath + '/page.html');
	// 	})

	// 	// var paths = ['/' + object.type, '/' + object.year + '-' + object.month],
	// 	// 	filepath = paths.join();
	// 	// for(var i = 0; i < paths.length; i++){
	// 	// 	var path,
	// 	// 		pathExist;
	// 	// 	for(var j = 0; j <= i; j++){
	// 	// 		path += paths[j];
	// 	// 	}
	// 	// 	pathExist = fs.existsSync(path);
	// 	// 	if(!pathExist){
	// 	// 		fs.mkdirSync(path);
	// 	// 	}
	// 	// 	else{
	// 	// 		break;
	// 	// 	}
	// 	// }

	// 	// var path = '/' + object.type + '/' + object.year + '/' + object.month + '/' + object.date + '/';
	// }
	crawl(url);
	// async.series([
	// 	// function(){
	// 	// 	console.log('Start Crawling');
	// 	// },
	// 	function(callback){	
	// 		console.log('Crawling Starts');		
	// 		crawl(url);
	// 		callback(null, 'Crawling');
	// 	},
	// 	// function(){
	// 	// 	console.log('End Crawling');
	// 	// },
	// 	// function(){
	// 	// 	console.log('Start Parsing');
	// 	// },
	// 	function(callback){
	// 		console.log('Parsing Starts');		
	// 		parse();
	// 		callback(null, 'Parsing');
	// 	}
	// 	// function(){
	// 	// 	console.log('End Parsing');
	// 	// }
	// ],
	// function(err, result){
	// 	console.log(result, 'is complete');
	// }
	// 	// crawl(url),
	// 	// parse()
	// // ],
	// // 	function(){
	// // 		console.log("Mission Complete")
	// // 	}
	// );
	// // crawl(url);
	
};