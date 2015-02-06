
/*
 * GET home page.
 */

var crawler = require('../crawler.js'),
	parser = require('../parser.js'),
	composer = require('../composer.js'),
	writer = require('../writer.js'),
	cheerio = require('cheerio'),
	async = require('async');

var	base = 'http://www.designashirt.com',
	firsturl = 'http://www.designashirt.com/c/category/how-it-works/',
	faqurl = 'http://www.designashirt.com/c/help-center/frequently-asked-questions/',
	crawlConcurrency = 4,
	downloadConcurrency = 12;

var collectUrl = function(nav){
	var $ = cheerio.load(nav),
		ullist = $('ul');
	ullist.each(function(index, value){
		if(index === 0){
			return;
		}
		var href = cheerio(value).find('li a').first().attr('href'),
			hashindex = href.indexOf('#');
		crawlQueue.push(base + href.substring(0, hashindex));
	});
	crawlQueue.push(base + $('h3>a').attr('href'));
};

var crawlQueue = async.queue(function (urlTask, callback) {
    console.log('\t-> Crawler queue processing task %s', urlTask);
    crawler.get(urlTask,function(err, content,status){
        if (err) return callback(err);
        console.log('\t\t-> Crawler retrieved %s', status, { ContentLength: content.length });
        var $ = cheerio.load(content);
        if(urlTask === firsturl){				
			collectUrl($('#w4_post_list').html());
		}
        parse($, urlTask, callback);
    });
}, crawlConcurrency);

crawlQueue.drain = function() {
    console.log('\n\nCrawler queue is empty\n\n\n');
    process.exit();
};

var crawl = function(url){
	console.log('\t-> Adding %s to crawl queue', url);
    crawlQueue.push(url);
	// crawler.get(url,function(content,status){
	// 	console.log('url',url);	
	// 	console.log("status", status);					
	// 	var $ = cheerio.load(content);
	// 	cacher.cache(url, content);
	// 	if(url === firsturl){				
	// 		collectUrl($('#w4_post_list').html());
	// 	}

	// 	if(count < urlList.length - 1){
	// 		count++
	// 		url = urlList[count];
	// 	}
	// 	else{
	// 		url = null;
	// 	}

	// 	if(!!url){				
	// 		crawl(url);		
	// 	}
	// 	else{
	// 		console.log('urlList', urlList);
	// 		parse();
	// 		return;
	// 	}			
	// });	
};

var parse = function($, url, callback){
	var tasks = [],
		type = (url.split('/'))[5],
		posts;
	if(url === faqurl){
		posts = $('.page, .single-faq');
	}
	else{
		posts = $('.pad .post');
	}
	posts.each(function(index, value){
		var obj = parser.parse(value),
			html;
		obj.type = type;
		html = composer.compose(obj);
		tasks.push(async.apply(writer.writefile, downloadConcurrency, obj, html));
	});
	async.parallelLimit(tasks, 2, function(err) {
        if (err) return callback(err);
        callback(null);
    });
};
crawl(firsturl);

// exports.index = function(req, res){
// 	var	base = 'http://www.designashirt.com',
// 		firsturl = 'http://www.designashirt.com/c/category/how-it-works/',
// 		faqurl = 'http://www.designashirt.com/c/help-center/frequently-asked-questions/',
// 		count = 0;

// 	var collectUrl = function(nav){
// 		var $ = cheerio.load(nav),
// 			ullist = $('ul');
// 		ullist.each(function(index, value){
// 			var href = cheerio(value).find('li a').first().attr('href'),
// 				hashindex = href.indexOf('#');
// 			urlList.push(base + href.substring(0, hashindex));
// 		});
// 		urlList.push(base + $('h3>a').attr('href'));
// 	};

// 	var crawl = function(url){
// 		crawler.get(url,function(content,status){
// 			console.log('url',url);	
// 			console.log("status", status);					
// 			var $ = cheerio.load(content);
// 			cacher.cache(url, content);
// 			if(url === firsturl){				
// 				collectUrl($('#w4_post_list').html());
// 			}

// 			if(count < urlList.length - 1){
// 				count++
// 				url = urlList[count];
// 			}
// 			else{
// 				url = null;
// 			}

// 			if(!!url){				
// 				crawl(url);		
// 			}
// 			else{
// 				console.log('urlList', urlList);
// 				parse();
// 				return;
// 			}			
// 		});	
// 	};

// 	var parse = function(){
// 		urlList.forEach(function(value, index){
// 			var content = cacher.fetch(value),
// 				$ = cheerio.load(content),
// 				posts,
// 				type = (value.split('/'))[5];
// 			if(value === faqurl){
// 				posts = $('.page, .single-faq');
// 			}
// 			else{
// 				posts = $('.pad .post');
// 			}
// 			posts.each(function(index, value){
// 				var obj = parser.parse(value),
// 					html;
// 				obj.type = type;
// 				html = composer.compose(obj);
// 				writer.writefile(obj, html);
// 			});
// 		});
// 	};
// 	crawl(firsturl);
// };