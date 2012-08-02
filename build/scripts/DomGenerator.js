/**
 * Fetches the compiled javascript file from the specified
 * folder and create HTML fragment depending upon the
 * instructions provided.
 * Uses tipTip.js to show fancy tooltips, and imgQ.js to get more than one 
 * images in parallel
 * Maintains it's own cache to avoid fetching scripts more than one time from server 
 * 
 *  @author avneesh
 */
(function($){
	
	/**
	 * folderPath: resources/folderPath/
	 * fileName: javascript filename without extension
	 * appendInstn: options {
	 * 							instnName:"configId" or ["configId","configId"],
	 * 							prefetch:false (if set to true, will just pre-fetch the file and cached it),
	 * 							element:HTMLElement (html element, to which the html fragment to be appended),
	 * 							contextData: any object (a javascript object, having data to be used in making HTML fragment)
	 * 							success: callBack function 
	 * 						}
	 */
	$.htmlBuilder=function(folderPath,fileName,appendInstn){
		makeHTML();
		//TODO Handle same file request simultaneously
		
		/**
		 * Make HTML from specified java-script file
		 */
		function makeHTML(){		
			fileName+=".js"; //append extension to java-script file name
			appendInstn=appendInstn || {}; //if no instructions given for append, just initialises it
		
			makeInstnHTML(function(html){
				if($.isFunction(appendInstn.success)){
					appendInstn.success(html);
				}
			});
			
			function makeInstnHTML(onReadyHTML){
				//package name is dot representation of folder path+filename
				var packageName=getPackageName(folderPath,fileName);
				var existingInstnObj=$.htmlBuilder.UIFunctions[packageName];
				if(existingInstnObj){
					if(isPreFetched()){ //If call is for pre-fetch, just call the callBack
						onReadyHTML();
						return;
					}
					objectToHTML(existingInstnObj); //Generate HTML from existing object
					return;
				}
				$.getScript(folderPath+fileName,function(){ //Get the script from the server
					if(isPreFetched()){
						onReadyHTML();
						return;
					}
					objectToHTML($.htmlBuilder.UIFunctions[packageName]);
				});
				
				function isPreFetched(){
					return (appendInstn && appendInstn.preFetch);
				}
				/**
				 * Make HTML from parsed java-script object 
				 */
				function objectToHTML(parsedObj){
					 var generatedIsntn=[]; //Initialise array for response
					 var configs=parsedObj["configs"]; //HTML instructions from java-script file object
					 var execs=parsedObj["execs"]; //UI Helper methods from java-script file object
					 /**
					  * execs={
					  * 	fn: function(){},
					  * 	afn: function(){},
					  * 	view:{
					  * 		fn: function(){}
					  * 	}
					  * }
					  */
					/**
					 * If any particular instruction from particular package
					 * is requested, make HTML for that part only
					 */
					if(appendInstn.instnName){
						var instnName=appendInstn.instnName;
						 if($.isArray(instnName)){
							 var instnLen=instnName.length;
							 for(var i=0;i<instnLen;i++){
								 getHTML(configs[instnName.splice(0,1)],execs,function(html){
										generatedIsntn.push(html);
										if(instnName.length<1)
											onReadyHTML(generatedIsntn);
									});
							 }
						} else 
							getHTML(configs[instnName],execs,function(html){
								onReadyHTML(html);
							});
					}
					//Otherwise create HTML for whole object
					else{
						for(instnsName in configs){
							getHTML(configs[instnsName],execs,function(html){
								generatedIsntn.push(html);
							});
						}
						onReadyHTML(generatedIsntn);
					}
					
				}
			}
			/**
			 * Create HTML from the given parsed instruction
			 */
			function getHTML(htmlInstn,execs,onHTMLGenerate){
				if(!htmlInstn)
					return;
				var contextData=null || appendInstn.contextData;
				var parentElement=null || appendInstn.element;
				var childHTMLs=[];
				if(htmlInstn.children){
					var numChild=htmlInstn.children.length;
					for(var i=0;i<numChild;i++){
						var instn=htmlInstn.children[i];
						checkAndGenerate(contextData,instn,function(html){
							childHTMLs.push(html);
						},parentElement);
					}
				}
				_onHTMLGenerate();	
				
				function _onHTMLGenerate(){
					var htmlsMap={};
					htmlsMap[htmlInstn.name]=childHTMLs;
					onHTMLGenerate(htmlsMap);
				}
				
				/**
				 * Check for condition attribute and repeat tag and generate HTML accordingly
				 */
				function checkAndGenerate(dataObj,instruction,onGenerate,parent){
					var condition=true;
					if(instruction.condition){ //Check whether element fulfilling certain condition or not. Don't create in case of false/undefined
						var fn=getFunction(execs, instruction.condition); //Get function from execs
						condition=fn(dataObj,parent);
					}
					if(!condition){
						onGenerate(null);
						return;
					}
					if(instruction.execpre){
						var fn=getFunction(execs, instruction.execpre);
						fn(dataObj,parent,function(cData,apndHTML){
							dataObj=cData || dataObj; //change context
							parent=apndHTML || parent; //change parent
							generate();
						});
					} else
						generate();
					
					//Generate HTML
					function generate(){
						if(instruction.name.toLowerCase()=="repeat"){ //handle in case of custom element <repeat repeatArray=""/>
							generateRepeatInstn(dataObj,instruction,condition,function(element){
								onGenerate(element);
							},parent);
						} else{
							createHTML(dataObj,instruction,function(element){
									$(parent).append(element); //append element to DOM after HTML creation in Memory for optimised results
									onGenerate(element);
								},parent);
							}
						}
					}
				/**
				 * Create HTML element,assign attribute to element and bind for events
				 */
				function createHTML(dataObj,instruction,onCreate,parent,repeat){
					if(instruction.name==="textNode"){
						var textValue=getValue(dataObj, "text", instruction["textvalue"],  parent);
						if(!textValue || textValue=='null')
							textValue="";
						var textNode=document.createTextNode(textValue);
						onCreate(textNode);
						return;
					}
					var currentElement=document.createElement(instruction.name);
					var attributes=instruction.attributes;
					if(attributes){
						for(attribute in attributes)
							$(currentElement).attr(attribute,getValue(dataObj, attribute, attributes[attribute], currentElement));
					}
					var events=instruction.events;
					if(events && execs){
						for(event in events)
							$(currentElement).bind(event,execs[events[event]]);
					}
					if(instruction.data){
						var fn=getFunction(execs,instruction.data);
						$(currentElement).data("cdata",fn(dataObj,currentElement));
					}
					if(instruction.children){
						var numChild=instruction.children.length;
						var children=instruction.children;
						for(var i=0;i<numChild;i++){
							var child=children[i];
							checkAndGenerate(dataObj, child,function(childElement){
								if(i==numChild-1)
									onChildAppend();
							}, currentElement);
						}
					} else
						onChildAppend();
					function onChildAppend(){
						if(instruction.execpost){ //function to call after HTML element creation
							var fn=getFunction(execs, instruction.execpost);
							fn(dataObj,currentElement);
						}
						if(instruction.tooltip){ //fancy toolTip, (used tipTip jquery plugin)
							$(currentElement).tipTip({
								content:getValue(dataObj, "toolTip", instruction.tooltip, currentElement)
							});
						}
						onCreate(currentElement);
					}
				}
				/**
				 * Generate repeat instructions
				 * Note: Do not use for large DOM manipulation. Not an efficient method for DOM manipulation
				 */
				function generateRepeatInstn(dataObj,instruction,condition,onRepeatComplete,parent){
					var repeatArrayAttr=instruction.attributes.repeatarray;
					var descendent=null;
					if(!repeatArrayAttr){
						onRepeatComplete(null);
						return;
					}
					var repeatArray=getValue(dataObj, "repeat", repeatArrayAttr,parent);
					if(!$.isArray(repeatArray) ||repeatArray.length<1){
						onRepeatComplete(null);
						return;
					}
					var arrValue;
					for(var i=0;i<repeatArray.length;i++){
						arrValue=repeatArray[i];
						if(instruction.children[0].name==="repeat"){
							generateRepeatInstn(arrValue,instruction.children[0],true,function(element){
								descendent=element;
							},parent);
						}
						else{
							var rptElmCond=instruction.children[0].condition;
							if(rptElmCond)
								condition=rptElmCond(arrValue);
							if(condition){
								createHTML(arrValue, instruction.children[0], function(element){
									descendent=element;
									$(parent).append(element);
								}, parent, true);
							} 
						}
					}
					onRepeatComplete(descendent);
				}
				/**
				 * Get value, either from function or object, if nothing match, return string
				 */
				function getValue(dataObj,pptName,property,html,callBack){
					var openBracketIndex=property.indexOf("(");
					//If property is function, call property
					if(openBracketIndex!=-1 && execs){
						var functionName=property.substring(0,openBracketIndex);
						if(execs[functionName])
							return execs[functionName](dataObj,html,callBack);
						return property.replace(/\^/g,"");
					}
					//parse string, if it may be an object
					var splitCharPos=property.indexOf(".");
					if(splitCharPos!=-1 && property[splitCharPos-1]!="^" && pptName!="src" && pptName!="href")
						return getContextInfo();
					else
						return property.replace(/\^/g,""); //If none of the above is satisfied, return the string
					
					//Read value from object
					function getContextInfo(){
						var steps=property.split(".");
						var value=dataObj[steps[1]];
						$.each(steps,function(i,step){
							if(i<=1)
								return true;
							value=value[step];
							if(!value)
								return false;
						});
						if(value==undefined || value==null)
							value="";
						return value;
					}
				}
			}
			/*
			 * Take full path as two arguments for folder path and filename
			 * return dot representation of path ex. www/example/ex.xml will be returned as 
			 * www.example.ex.xml 
			 */
			function getPackageName(folder,file){
				return $.trim(folder.replace(/\//g,".")+file);
			}
		};
		function getFunction(execs,functionName){
			return execs[functionName.substring(0,functionName.indexOf("("))];
		}
	};
	/**
	 * used imgQ plugin to load images in parallel,
	 * imageMap structure is liked linkedHashMap
	 * imageMap.keyset:[key1,key2...],
	 * key1:image1 source,
	 * key2:image2 source
	 * onCurrentLoad is called on each image load
	 * onLoad is called when all the images in queue are loaded
	 */
	$.htmlBuilder.loadImages=function(imageMap,onLoad,onCurrentLoad){
		if(!imageMap.keySet)
			return;
		var imagesQ=new imageLoader();
		imagesQ.queue_images(imageMap.keySet);
		imagesQ.process_queue();
		imagesQ.onLoaded = function(isError) {
			var source = imagesQ.current.src;
			var imgElement = imageMap[source];
			if(isError && onCurrentLoad){
				onCurrentLoad(imgElement,false);
				return;
			}
			$(imgElement).attr('src', source);
			if(onCurrentLoad)
				onCurrentLoad(imgElement,true);
		};
		imagesQ.onComplete=function(){
			if(onLoad)
				onLoad();
		};
	};
	/**
	 * A simple cache to keep config object to create HTML
	 */
	$.htmlBuilder.UIFunctions=function(functionName,functionsObj){
		$.htmlBuilder.UIFunctions[functionName]=functionsObj;
	};
})($);
