(function(){ var instructions={"configs":{"home-container":{"name":"home-container","children":[{"name":"DIV","events":{},"attributes":{"id":"container"},"children":[{"name":"H1","events":{},"attributes":{},"children":[{"name":"textNode","textvalue":"Go geta home"}]},{"name":"DIV","condition":"isNestedContainer()","events":{},"attributes":{"class":"nested-container-sample"},"children":[{"name":"SPAN","events":{},"attributes":{"class":"nested-element"}}]}]}]},"repeat-sample":{"name":"repeat-sample","children":[{"name":"DIV","events":{},"attributes":{"id":"repeat-sample"},"children":[{"name":"REPEAT","events":{},"attributes":{"repeatarray":"getItemArray()"},"children":[{"name":"SPAN","events":{},"attributes":{},"children":[{"name":"textNode","textvalue":"getItemElem()"}]}]}]}]}},"execs":{
		isNestedContainer: function(contextData,htmlElement){
			return true; //this element and nested element will not be generated if it is false, 
		},
		getItemArray: function(contextData){
			return contextData.items;
		},
		getItemElem: function(itemName){
			return itemName;
		}
}};$.htmlBuilder.UIFunctions('resources.home.home.js',instructions);})();