var Parser = function(){};
var cheerio = require('cheerio');
Parser.prototype.parse = function(article){
	var $ = cheerio.load(article),
		obj = {},
		datearray;
	obj.title = $('.entry-title a').text();
	obj.author = $('.author a').text();
	obj.datetext = $('time.published').text();
	datearray = $('time.published').attr('datetime').split('-');
	obj.date = parseInt(datearray[2]);
	obj.month = parseInt(datearray[1]);
	obj.year = datearray[0];
	obj.contents = $('.sqs-block-image .thumb-image, .sqs-block-image .image-caption p, .sqs-block-html p');
	obj.categories = $('.categories a');
	obj.tags = $('.tags a');
	obj.like = ($('.like-count').text().split(' '))[0];
    obj.$ = $;
	return obj;
};

module.exports = new Parser();
