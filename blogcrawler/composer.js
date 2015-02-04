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
	material.categories.each(function(index, value){
		$('head').append(
			cheerio(meta).attr('key', material.type + 'Category')
				.attr('value', cheerio(value).text())
		);
	});
	material.tags.each(function(index, value){
		$('head').append(
			cheerio(meta).attr('key', material.type + 'Tag')
				.attr('value', cheerio(value).text())
		);
	});
	$('head').append(
			cheerio(meta).attr('key', 'date')
				.attr('value', material.datetext)
		).append(
			cheerio(meta).attr('key', 'resource')
				.attr('value', material.type)
		).append(
			cheerio(meta).attr('key', 'layout')
				.attr('value', material.type + '/post')
		).append(
			cheerio(meta).attr('key', 'route')
				.attr('value', '/' + material.type + '/' + material.year + '/' + material.month + '/' + material.date + '/' + creatRouteFromTitle(material.title))
		).append(
			cheerio(meta).attr('key', 'description')
				.attr('value', cheerio(getDescription(material.contents).text()))
		);

	material.foldername = creatRouteFromTitle(material.title);
	//Compose the body
	$('body').append(cheerio(h).text(material.title));
	material.contents.each(function(index, value){
		// if(cheerio(value).is('.sqs-block-image .image-caption p') || cheerio(value).is('.sqs-block-html p')){
		// 	value = cheerio(value).text();
		// }
		if(cheerio(value).is('img')){
			value = cheerio(img).attr('src', cheerio(value).attr('data-src'));
		}
		// else if(cheerio(value).has('span')){
		// 	console.log('index', index, 'I am fucking span!!');
		// 	console.log(cheerio(value).find('span'));
		// 	value = cheerio(value).find('span').attr('style', '');
		// }
		else{
			cheerio(value).find('span').removeAttr('style');
			value = cheerio(value).html();
		}
		$('body').append(cheerio(p).append(value));
	});
	// console.log('Entire HTML: ', $.html());
	return $.html();
};
module.exports = new Composer();