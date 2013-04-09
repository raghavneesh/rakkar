/**
 * Fetches instructions set from server asynchronously
 * and create dynamic HTML for the instruction set.
 * Uses tiptip.js (https://github.com/drewwilson/TipTip) to show
 * fancy tooltips.
 * Cache instructions set for re-usability.
 * 
 * Instruction set structure - 
 * {
 * 	configs : {
 * 		name 		: 'div',
 * 		children 	: [],
 * 		attributes 	: {
 * 			id		: 'foo',
 * 			class 	: function()
 * 		},
 * 		events : {
 * 			click : function1,
 * 			focus : function2
 * 		}
 * 	},
 * 	execs : {
 * 		function 	: function(){}, //UI Helper function
 * 		function1	: function(){},
 * 		function2	: function(){}
 * 	}
 * }
 *  
 * @author avneesh
 */
//TODO  Prevent multiple requests for the same instruction set until  response is not arrived
//TODO  Optimise caching. Implement LRU cache or store in browser's local storage.

!function(W,D,$){
	//cache to keep instructions set
	var _cache = {},
	/**
	 * Class to create dynamic HTML
	 * @param {String} filePath - Full path of the file containing instruction set
	 * @param {Object} options - Options to change default behaviour for HTML creation
	 * 	{
	 * 		instnName 	: {string/array} Name of instruction(s) to create HTML
	 * 		prefetch  	: {boolean} Set true to prefetch instructions.
	 * 		appendTo  	: {HTMLElement} Element to which the generated fragment is to be appended
	 * 		contextData : {Object} Context object to pass to the UI helper functions 
	 * 	 }
	 * @returns jQuery deferred object 
	 */
	HTMLBuilder = function(filePath,options){
		//Default options
		var defaultOpts = {
				prefetch	: false	
		},
		that = this,
		deferred = $.Deferred();
		that.options = $.extend(defaultOpts,options);
		
//		Get instructions set
		that.getInstuctionsSet(filePath)
		.done(function(instructionSet){
			//Generate instructions set
			that.instructionSetToHTML(instructionSet)
			.done(function(html){
				//Resolve deferred with generated HTML
				deferred.resolveWith(deferred,[html]);
			});
		});
		return deferred;
	};
	/**
	 * Fetches instructions set asynchronously from server/cache
	 * @param {String} filePath - Path to the file containing instructions set
	 * 
	 * @returns jQuery deferred object
	 */
	HTMLBuilder.prototype.getInstuctionsSet = function(filePath){
		var that = this,
		deferred = $.Deferred(),
		//get package name corresponding to the file path
		packageName = HTMLBuilder.getPackageName(filePath.split('\?_=')[0],that.options.appResource),
		//Fetch from cache
		instructionSet = _cache[packageName];
		if(instructionSet)
			deferred.resolveWith(deferred,[instructionSet]);
		else {
			if(W.name === 'nodejs' && W.loadScripts){
				W.loadScripts(W,filePath,function(){
					deferred.resolveWith(deferred,[_cache[packageName]]);
				});
			} else{
				//Fetch instructions from server
				$.ajax(filePath,{
					dataType 	: 'script',
					cache		: true
				}).done(function(){
					deferred.resolveWith(deferred,[_cache[packageName]]);
				}).fail(deferred.reject);
			}
		}
		return deferred;
	};
	/**
	 * Convert instructions set to HTML fragment
	 * @param {Object} instructionSet - Rakkar instructions set
	 * 
	 * @returns jQuery deferred object 
	 */
	HTMLBuilder.prototype.instructionSetToHTML = function(instructionSet){
		var deferred = $.Deferred(),
		that = this,
		//Result set to keep generated HTML by instruction name
		generatedHTML = {},
		instructionName = that.options.instnName;
		that.configs = instructionSet['configs']; //HTML instructions
		that.executables = instructionSet['execs'];  //Hash of UI helper functions used in HTML instructions
		//If instruction name is not provided, generate HTML for all instructions in instructions set
		if(!instructionName){
			for(var instnName in configs){
				generatedHTML[instnName] = that.instructionsToHTML(that.configs[instnName]);
			}
		} else if($.isArray(instructionName)){ //Generate HTML for all instructions names
			for(var i=0;i < instructionName.length;i++){
				generatedHTML[instructionName[i]] = that.instructionsToHTML(that.configs[instructionName[i]]);
			}
		} else // generate html for specific instruction name
			generatedHTML[instructionName] = that.instructionsToHTML(that.configs[instructionName]);
		deferred.resolveWith(deferred,[generatedHTML]);
		return deferred;
	};
	/**
	 * Generate HTML for given instruction
	 * @param {Object} HTML Instruction
	 * 
	 * @returns {array} HTML fragments
	 */
	HTMLBuilder.prototype.instructionsToHTML = function(htmlInstruction){
		if(!htmlInstruction || !htmlInstruction.name)
			return;
		var that = this,
		contextData = that.options.contextData,
		appendTo = that.options.appendTo,
		childFragments = [],
		childInstruction;
		// Generate HTML fragments for each children in HTML instruction
		if($.isArray(htmlInstruction.children)){
			for(var i = 0;i< htmlInstruction.children.length;i++){
				childInstruction = htmlInstruction.children[i];
				//generate HTML for child instruction
				that.generateHTML(contextData,childInstruction,function(generatedHTML){
					childFragments.push(generatedHTML);
				},appendTo);
			}
		}
		return ((childFragments.length === 1)? childFragments[0] : childFragments);
	};
	/**
	 * Instruction's pre-processor.
	 * Check condition. Execute 'execpre' if exists.
	 * 
	 * @param {Object} - data - context data to be passed to UI helper
	 * @param {Object} - instruction - instruction to generate HTML
	 * @param {function} - onGenerate - Callback to be called on HTML generation
	 * @param {HTML element} - parent - element to which HTML fragment will be appended
	 */
	HTMLBuilder.prototype.generateHTML = function(data,instruction,onGenerate,parent){
		var that = this,
		generateElement = true, //Generate HTML by default
		onExecPre,
		//Check if callback is function and call the same.
		onHTMLGenerate = function(html){
			if($.isFunction(onGenerate))
				onGenerate(html);
		};
		//Check if instruction has any condition
		if(instruction.condition){
			fn = HTMLBuilder.getExecutable(that.executables,instruction.condition);
			generateElement = HTMLBuilder.execute(fn,[data,parent],that);
		}
		//If condition for generate HTML doesn't return true, do not generate HTML for instruction
		if(!generateElement){
			onHTMLGenerate();
			return;
		}
		//Execute 'execpre' before HTML generation. Pass callback for asynchronous working
		if(instruction.execpre){
			onExecPre = function(contextData,appendTo){
				data = contextData || data;
				appendTo = appendTo || parent;
			};
			fn = HTMLBuilder.getExecutable(that.executables,instruction.execpre);
			HTMLBuilder.execute(fn,[data,parent,onExecPre],that);
		}
		//if 'repeat' instruction arrive. Generate Repeat Instructions
		if(instruction.name.toLowerCase() === 'repeat'){
			that.generateRepeatInstruction(data,instruction,generateElement,onHTMLGenerate,parent);
		} else{
			//Create HTML fragment
			that.createFragment(data,instruction,function(element){
				$(parent).append(element); //append element to DOM after HTML creation in Memory for optimised results
				onHTMLGenerate(element);
			},parent);
		}
	};
	/**
	 * Create HTML fragment
	 * Set attributes value, bind events, set data and execute post-processors,
	 * attach fancy tool tip.
	 * 
	 * @param {Object} - data - context data to be passed to UI helper function
	 * @param {Object} - instruction - instruction to generate HTML
	 * @param {function} - onCreate- Callback to be called on HTML generation
	 * @param {HTML element} - parent - element to which HTML fragment will be appended
	 * @param {boolean} - repeat - If executing repeat instruction 
	 */
	//FIXME repeat boolean is not using in createFragment function. Test this out
	HTMLBuilder.prototype.createFragment = function(data,instruction,onCreate,parent,repeat){
		var that = this,
		$currentElement,
		fn,
		//Returns text node for the text value in  instruction
		getTextNode = function(){
			var textValue = that.getValue(data,'text',instruction['textvalue'],  parent) || '';
			return D.createTextNode(textValue);
		},
		//Set attributes for the current element
		setAttributes = function(){
			var attributes = instruction.attributes;
			if(!attributes)
				return;
			for(var attribute in attributes){
				$currentElement.attr(attribute,
						that.getValue(data,attribute,attributes[attribute],$currentElement));
			}
		},
		//Bind events for the current element
		bindEvents = function(){
			var events = instruction.events;
			if(!events || !that.executables)
				return;
			for(var event in events)
				$currentElement.on(event,that.executables[events[event]]);
		},
		//Append current element children
		appendChildren = function(){
			var children = instruction.children,
			i = 0;
			if(!children)
				return;
			for(i;i<children.length;i++)
				that.generateHTML(data,children[i],undefined,$currentElement);
		};
		//instruction has text in 'textNode'
		if(instruction.name === 'textNode'){
			onCreate(getTextNode());
			return;
		}
		$currentElement = $(D.createElement(instruction.name));
		setAttributes();
		bindEvents();
		//Set data in current element if require
		if(instruction.data)
			$currentElement.data('cData',that.getValue(data,'data',instructions.data,parent));
		appendChildren();
		//Execute function after element and it's children have been created
		if(instruction.execpost){
			fn = HTMLBuilder.getExecutable(that.executables,instruction.execpost);
			HTMLBuilder.execute(fn,[data,$currentElement],that);
		}
		//Attach fancy tooltip on the element
		if(instruction.toolTip && $.fn.tipTip){
			$currentElement.tiptip({
				content : that.getValue(data,'toolTip',instruction.toolTip,$currentElement)
			});
		}
		onCreate($currentElement);
	};
	/**
	 * Generate repeated instruction for an array.
	 * Read array with special attribute 'repeatarray'.
	 * Check condition on repeat element.
	 * 
	 * @param {Object} - data - context data to be passed to UI helper function
	 * @param {Object} - instruction - instruction to generate HTML
	 * @param {boolean} - condition - Condition attribute for repeat instruction
	 * @param {function} - onComplete- Callback to be called on instruction completion
	 * @param {HTML element} - parent - element to which HTML fragment will be appended
	 *
	 */
	//FIXME Remove condition attribute after testing
	HTMLBuilder.prototype.generateRepeatInstruction = function(data,instruction,condition,onComplete,parent){
		var that = this,
		//get the repeat array attribute
		repeatArrayAttribute = instruction.attributes.repeatarray,
		descendent = null,
		repeatArray,
		fn,
		generateElement = true,
		condition,
		i = 0;
		if(!repeatArrayAttribute){
			onComplete();
			return;
		}
		repeatArray = that.getValue(data,'repeat',repeatArrayAttribute,parent);
		//if the value coming from repeat array is not {array} just return
		if(!$.isArray(repeatArray)){
			onComplete();
			return;
		}
		//Iterate over array and generate HTML for all elements
		for(i; i < repeatArray.length; i++){
			arrayValue = repeatArray[i];
			//If first child is again a repeat element, handle this
			if(instruction.children[0] && instruction.children[0].name === 'repeat'){
				that.generateRepeatInstruction(arrayValue,instruction.children[0],true,function(element){
					descendent = element;
				});
			} else{
				//Check condition on array item
				if(instruction.children[0].condition){
					fn = HTMLBuilder.getExecutable(that.executables,instruction.children[0].condition); 
					generateElement = HTMLBuilder.execute(fn,[arrayValue]);
				}
				if(generateElement){
					//Create HTML fragment
					that.createFragment(arrayValue,instruction.children[0],function(element){
						descendent = element;
						$(parent).append(element);
					},parent,true);
				}
			}
		}
		//callback when instruction completed
		onComplete(descendent);
	};
	/**
	 * Get value for expression in instruction.
	 * Value can be a function/Object/String.
	 * Dot(.) separated attribute strings are considered as object notation, except 'href' && 'src' .
	 * If String has escaped dot(^.), it will be considered as normal string.
	 * 
	 * @param {Object} - data - context data to be passed to UI helper function
	 * @param {String} - attributeName - Name of the attribute
	 * @param {String} - attributeValue - Value of the attribute
	 * @param {HTML element} - Element to be passed to UI helper function
	 * @param {callback} - Callback to be passed to UI helper function
	 * 
	 * @returns value of the attribute
	 */
	//TODO Recognize url type and remove special handling of 'src' and 'href'
	
	HTMLBuilder.prototype.getValue = function(data,attributeName,attributeValue,html,callBack){
		var that = this,
		//Check, if String is of Object Notation
		isContextInfo = function(attribute){
			ESCAPE_CHARACTER = '^';
			var accessCharPosition = attribute.indexOf('.');
			return (accessCharPosition !== -1 
					&& attribute[accessCharPosition -1] !== ESCAPE_CHARACTER)
		},
		//Parse String and try to get value form context object
		getContextInfo = function(){
			var steps = attributeValue.split('.'),
			value = data[steps[1]],
			i = 0,
			step;
			for(i;i< steps.length;i++){
				if(i < 2)
					continue;
				step = steps[i];
				value = value[step];
				if(!value)
					break;
			}
			value = value || '';
			return value;
		},
		valueFunction = HTMLBuilder.getExecutable(that.executables,attributeValue);
		if($.isFunction(valueFunction))
			return valueFunction.apply(that.executables,[data,$(html),callBack]); //Execute function
		//If attribute name is not Image's src or anchor's href and it is of context type, return context Value
		if(attributeName !== 'src' 
			&& attributeName !== 'href' 
				&& isContextInfo(attributeValue)){
			return getContextInfo();
		}
		//Return string, by replace escape character
		return attributeValue.replace(/\^/g,''); //If none of the above is satisfied, return the string
	};
	/**
	 * Package here is like java package system.
	 * Package starts with appResource (Hack. Cant think of anything better right now)
	 * Replace all forward slashes (/) with dot(.)
	 * e.g. 'view/home/home.js' ------> view.home.home.js
	 * 
	 * @param {String} - filePath - Path to the file containing instructions set
	 * @param {String} - appResource - Instruction set resources folder
	 */
	HTMLBuilder.getPackageName = function(filePath,appResource){
		filePath = filePath.substring(filePath.indexOf(appResource));
		return $.trim(filePath.replace(/\//g,'.'));
	};
	/**
	 * Get function from instructions set executables.
	 * @param {Object} - Instruction set executable
	 * @param {name} - Name of the function
	 * 
	 * @returns Function
	 */
	HTMLBuilder.getExecutable = function(executables,name){
		return executables[name.substring(0,name.indexOf('('))];
	};
	/**
	 * Check and execute the function.
	 * 
	 * @param {function} - executable - Function to be executed
	 * @param {array} - args - Arguments to be passed to the function
	 * @param {Object} - Context to be passed to the function
	 */
	HTMLBuilder.execute = function(executable,args,context){
		context = context || this; //By default Context would be HTMLBuilder Object
		if($.isFunction(executable))
			return executable.apply(context,args);
	};
	/**
	 * Rakkar interfaces
	 */
	W.rakkar = {};
	$.extend(W.rakkar,{
		/**
		 * Wrapper around HTMLBuilder.
		 * 
		 * @returns HTMLBuilder Object 
		 */
		createHTML : function(filePath,options){
			return new HTMLBuilder(filePath,options);
		},
		/**
		 * Add instruction set to the HTMLBuilder's cache
		 * Used by instructions set script to put the instruction set
		 * in cache on load.
		 * @param {String} - pkgPath 
		 * @param {Object} - instructionSet
		 */
		addInstructionSet : function(pkgPath,instructionSet){
			_cache[pkgPath] = instructionSet;
		},
		/**
		 * Return instruction set associated with the given package path
		 * 
		 */
		getInstructionSet : function(pkgPath){
			return _cache[pkgPath];
		},
		/**
		 * Remove instruction set from memory associated with the given package path
		 */
		removeInstructionSet : function(pkgPath){
			delete _cache[pkgPath];
		}
	});
}(window,window.document,(window.Zepto || window.jQuery));