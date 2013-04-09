$(document).ready(function(){
	var filePath = 'resources/home/home.js';
	rakkar.createHTML(filePath,{
		appendTo	: $('body'),
		instnName 	: 'home-container',
	}).done(function(htmlCollection){
		rakkar.createHTML(filePath,{
			appendTo	: htmlCollection['home-container'],
			instnName	: 'repeat-sample',
			contextData	: {
				items	: ['sample1','sample2','sample3']
			}
		});
	
		//Returns map of HTML fragment(s)
	});
});
