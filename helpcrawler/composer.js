var Composer = function(){};
var cheerio = require('cheerio');
var template = '<!DOCTYPE html><html lang="en-US"><head><meta http-equiv="Content-Type" value="text/html; charset=utf-8"><title></title></head><body></body></html>',
	meta = '<meta>',
	p = '<p></p>',
	img = '<img>',
	h = '<h1></h1>';
var creatRouteFromTitle = function(title){
	return title.replace(/['\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}]/g, '')
				.replace(/\s/g, '-')
				.replace(/-+/g, '-').toLowerCase();
};
var getDescription = function(content){
	$ = cheerio.load(content);
	return $('p span').first();
}
Composer.prototype.compose = function(material){
	var $ = cheerio.load(template);

	//Compose the head
	$('head').append('<title>' + material.title + '</title>');
	
	$('head').append(
			cheerio(meta).attr('key', 'resource')
				.attr('value', material.type)
		).append(
			cheerio(meta).attr('key', 'layout')
				.attr('value', material.type + '/post')
		).append(
			cheerio(meta).attr('key', 'route')
				.attr('value', '/' + material.type + '/' + creatRouteFromTitle(material.title))
		);

	material.foldername = creatRouteFromTitle(material.title);
	//Compose the body
	$('body').append(cheerio(h).text(material.title));
	material.contents.each(function(index, value){
		if(cheerio(value).is('img') && !cheerio(value).attr('src')){
			return;
		}
		else if(cheerio(value).is('h3') || cheerio(value).is('p')){
			value = cheerio(value).html();
		}
		else if(cheerio(value).is('tr')){
			if(cheerio(value).children('td').length === 1){
				return;
			}
			value = cheerio(value).find('td').first().html() + '&nbsp;&nbsp;&nbsp;&nbsp;' +  cheerio(value).find('td').last().html();
		}
		$('body').append(cheerio(p).append(value));
	});
	return $.html();
};
module.exports = new Composer();