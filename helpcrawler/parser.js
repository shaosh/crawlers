var Parser = function(){};
var cheerio = require('cheerio');
Parser.prototype.parse = function(post){
	var $ = cheerio.load(post),
		obj = {};
	obj.title = $('.entry-title').text();
	if(cheerio(post).hasClass('post') && cheerio(post).attr('id') !== 'post-203'){
		//post-203 is tool guide which has special format
		//post-38 is FAQ which also has special format
		obj.contents = $('.entry-content .help-img img, .entry-content p, .entry-content>ul, .entry-content>ol');
	}
	else if(cheerio(post).attr('id') === 'post-203'){
		obj.contents = $('h3, tr');
	}
	else if(cheerio(post).hasClass('page')){
		obj.contents = $('.entry-content>p');
	}
	else{
		obj.title = $('.faq-question').text();
		obj.contents = $('.faq-answer>p, .faq-answer>ul, .faq-answer>ol');
	}
	obj.$ = $;
	return obj;
};

module.exports = new Parser();