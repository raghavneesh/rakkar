var instruction={
		isNestedContainer: function(contextData,htmlElement){
			return true; //this element and nested element will not be generated if it is false, 
		},
		getItemArray: function(contextData){
			return contextData.items;
		},
		getItemElem: function(itemName){
			return itemName;
		}
};