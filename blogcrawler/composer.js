var S = require('string');

var Composer = function(){};
var cheerio = require('cheerio');
var template = [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '<head>',
        '\t<meta http-equiv="Content-Type" value="text/html; charset=utf-8">',
        '',
        '\t<title>{{TITLE}}</title>',
        '',
        '{{HEAD}}',
        '</head>',
        '<body>',
        '</body>',
        '</html>'
    ].join('\n'),
	meta = '<meta>',
	p = '<p></p>',
	img = '<img>',
	h = '<h1></h1>';
var creatRouteFromTitle = function(title){
	return S(title).slugify().s;
};

function stripNewLines(html) {
  return html.replace(/\n/g, '__!NEWLINE!__');
}
function putNewLinesBack(html) {
  return html.replace(/__\!NEWLINE\!__/g, '\n');
}

function removeHtmlTags(html) {
    return (html || '').replace(/<\s*[\w\d\-]+[^>]*?>/g, '');
}


function removeAttributes(html, attribute) {
  return html.replace(new RegExp('\\s+' + attribute.replace(/\-/g, '\\-') + '\\s*=\\s*"[^"]*?"', 'ig'), '');
}


function loadTemplate(vals) {
    var replacedTemplate = template;
    for (var key in vals) {
        replacedTemplate = replacedTemplate.replace(new RegExp('\\{\\{' + key + '\\}\\}'), vals[key]);
    }
    replacedTemplate = replacedTemplate.replace(/\{\{[^\}]+\}\}/g, '');
    return cheerio.load(replacedTemplate);
}

Composer.prototype.compose = function(material){
    var title, head;

    title = material.title || '';

    head = [];

	material.categories.each(function(index, value){
        head.push('\t<meta key="' + material.type + 'Category' + '" value="' + removeHtmlTags(material.$(this).html()) + '">');
	});
	material.tags.each(function(index, value){
        head.push('\t<meta key="' + material.type + 'Tag' + '" value="' + removeHtmlTags(material.$(this).html()) + '">');
	});
    head.push('\t<meta key="date" value="' + removeHtmlTags(material.datetext) + '">');
    head.push('\t<meta key="resource" value="' + removeHtmlTags(material.type) + '">');
    head.push('\t<meta key="layout" value="' + removeHtmlTags(material.type + '/post') + '">');
    head.push('\t<meta key="route" value="' + '/' + material.type + '/' + material.year + '/' + material.month + '/' + material.date + '/' + creatRouteFromTitle(removeHtmlTags(material.title)) + '">');

	material.foldername = creatRouteFromTitle(material.title);

    var $ = loadTemplate({ TITLE: title, HEAD: head.join('\n') });

	//Compose the body
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

    return removeAttributes(removeAttributes(removeAttributes($.html(), 'id'), 'class'), 'style');
};
module.exports = new Composer();
