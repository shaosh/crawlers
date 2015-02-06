var Composer = function(){};
var cheerio = require('cheerio'),
	S = require('string');
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
	var title, head, $;
	title = material.title || '';
	head = [];

	//Compose the head
	head.push('\t<meta key="resource" value="' + removeHtmlTags(material.type) + '">');
    head.push('\t<meta key="layout" value="' + removeHtmlTags(material.type + '/post') + '">');
    head.push('\t<meta key="route" value="' + '/post/' + material.type + '/' + creatRouteFromTitle(material.title) + '">');
	
	material.foldername = creatRouteFromTitle(material.title);
	$ = loadTemplate({ TITLE: title, HEAD: head.join('\n') });
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
	return removeAttributes(removeAttributes(removeAttributes($.html(), 'id'), 'class'), 'style');
};
module.exports = new Composer();