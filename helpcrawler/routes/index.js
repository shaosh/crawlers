
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

exports.index = function(req, res){
	var	base = 'http://www.designashirt.com',
		firsturl = 'http://www.designashirt.com/c/category/how-it-works/',
		faqurl = 'http://www.designashirt.com/c/help-center/frequently-asked-questions/',
		count = 0;

	var collectUrl = function(nav){
		var $ = cheerio.load(nav),
			ullist = $('ul');
		ullist.each(function(index, value){
			var href = cheerio(value).find('li a').first().attr('href'),
				hashindex = href.indexOf('#');
			urlList.push(base + href.substring(0, hashindex));
		});
		urlList.push(base + $('h3>a').attr('href'));
	};

	var crawl = function(url){
		crawler.get(url,function(content,status){
			console.log('url',url);	
			console.log("status", status);					
			var $ = cheerio.load(content);
			cacher.cache(url, content);
			if(url === firsturl){				
				collectUrl($('#w4_post_list').html());
			}

			if(count < urlList.length - 1){
				count++
				url = urlList[count];
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
		});	
	};

	var parse = function(){
		urlList.forEach(function(value, index){
			var content = cacher.fetch(value),
				$ = cheerio.load(content),
				posts,
				type = (value.split('/'))[5];
			if(value === faqurl){
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
				writer.writefile(obj, html);
			});
		});
	};
	crawl(firsturl);
};