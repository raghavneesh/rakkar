$(document).ready(function(){
	//Create home container
	_createHomeContainer();
	//Repeat element samples
	_createRepeatSample();
	
	function _createHomeContainer(){
		createHTML("resources/home/", "home", {
			element:$("body"),
			instnName:"home-container"
		}, function(response){});
	}
	function _createRepeatSample(){
		createHTML("resources/home/", "home", {
			element:$("body"),
			contextData:{
							items:["sample1","sample2","sample3","sample4"]
		
						},
			instnName:"repeat-sample"
		}, function(response){});
	}
});
function createHTML(dir, file, intructions, onHTMLCreate) {
	$.htmlBuilder(dir, file, {
		element : intructions.element,
		contextData : intructions.contextData,
		instnName : intructions.instnName,
		preFetch : intructions.preFetch,
		success : onHTMLCreate
	});
}