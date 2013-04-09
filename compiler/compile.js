/**
 *  Compile raw xml and helper javascript file
 *  and convert it into the format to be delivered
 *  on the web.
 *  Takes path of the source xml file name, that is to be compiled
 *  
 * @author avneesh
 */
global.fileSystem = require('fs'); //Global file system object
global.path = require('path'); //Global path object
//Get arguments provided
var args=process.argv.splice(2),
/**
 * Initialise compiler and application properties
 */
initialize = function(argsMap,onInitiaization){
	var compilerProperties,
	applicationProperties,
	propertyBase;
	try{
		compilerProperties = argsMap[argumentsMapper.compilerProperties];
		applicationProperties = argsMap[argumentsMapper.appProperties];
		if(!compilerProperties || !fileSystem.existsSync(compilerProperties))
			throw new Error('Could not read properties file for compiler : ' +  compilerProperties);
		if(!applicationProperties || !fileSystem.existsSync(applicationProperties))
			throw new Error('Could not read properties file for application : ' +  applicationProperties);
		global.compilerProperties = require(path.resolve(compilerProperties)).properties;
		global.jQuery = require(global.compilerProperties.modules.jQuery);
		global.DOM = require(global.compilerProperties.modules.jsDom).jsdom;
		global.appProperties = require(path.resolve(applicationProperties)).properties;
		propertyBase = path.dirname(applicationProperties);
		global.appProperties.source = path.resolve(propertyBase, appProperties.source);
		global.appProperties.buildPath = path.resolve(propertyBase, appProperties.buildPath);
		onInitiaization();
	}catch(exception){
		console.log(exception);
	}
},
/**
 * Walk recursively on path provided and call action
 */
fileWalk = function(sourcePath,action){
	fileSystem.readdir(sourcePath, function(err, files){
		if(err)
			throw new Error(err);
		files.forEach(function(file){
			var filePath = sourcePath +'/'+ file;
			fileSystem.stat(filePath, function (err, stat) {
				if(stat && stat.isDirectory())
					fileWalk(filePath,action);
				else if(action && (typeof action === 'function')){
							action(sourcePath,path.basename(filePath));
						}
			});
		});
	});
},
/**
 * Create directories in the path recursively
 */
createDirectoryPath = function(directoryPath){
	var directorySplit = directoryPath.split('/'),
	directoriesToCreate = [],
	tempPath = directoryPath,
	i = directorySplit.length,
	seperatorLastIndex;
	for(i; i > 0; i--){
		if(!fileSystem.existsSync(tempPath)){
			seperatorLastIndex = tempPath.lastIndexOf('/');
			if(seperatorLastIndex !== -1){
				directoriesToCreate.push(tempPath.substring(seperatorLastIndex));
				tempPath = tempPath.substring(0,seperatorLastIndex);
			}
		} else
			break;
	}
	_createRemaining();
	
	function _createRemaining(){
		directoriesToCreate = directoriesToCreate.reverse();
		var i = 0;
		for(i; i < directoriesToCreate.length; i++){
			tempPath+=directoriesToCreate[i];
			fileSystem.mkdirSync(tempPath,755);
		}
	}
},
/**
 * Write the final script at the specified path
 */
writeScript = function(directory,file,script){
	var targetPath = appProperties.buildPath + directory,
	scriptPath;
	createDirectoryPath(targetPath);
	scriptPath = targetPath + '/' + file,
	
	minify = function(script){
		var terminal = require('child_process').spawn('bash');

	      terminal.stdout.on('data', function (data) {
	          console.log(data);
	      });

	      terminal.on('exit', function (code) {
	              if(code !== 0)
	            	  throw new Error('Error while minifying '+script);
	      });

	      setTimeout(function() {
	    	  var jarFile = path.resolve('../lib/yuicompressor-2.4.2.jar');
	    	  jarFile = jarFile.replace(/\s/g,'\\ ');
	    	  script = script.replace(/\s/g,'\\ ');
	          terminal.stdin.write('java -jar  '+ jarFile +' --type js --charset UTF-8 -o '+script+' '+script);
	          terminal.stdin.end();
	      }, 1000);
	};
	fileSystem.writeFile(scriptPath,script,function(writeError){ //write file to the file system
      if(writeError)
    	  throw new Error('Unable to write file ' + scriptPath);
      	minify(scriptPath);
	});
},
/**
 * Generate the script, which is going to run in browser
 */
generateScript = function(directoryPath,fileName,json){
	var scriptName = fileName.substring(0,fileName.indexOf('.'))+'.js',
	scriptDirectory = directoryPath.replace(appProperties.source,'');
	clientScriptGenerator.generate(scriptDirectory,scriptName, json,function(generateError,script){
		if(generateError)
			throw new Error('Error while generating script '+ dirPath + fileName);
		writeScript(scriptDirectory,scriptName,script);
	});
},
/**
 * After the compiler initialises
 */
onInitialize = function(){
	fileWalk(appProperties.source,function(dirPath,fileName){
		if(fileName && (path.extname(fileName) === '.xml')){
			try{
				xmlToJson.parse(dirPath,fileName,null,function(parseError,json){
					if(parseError)
						throw new Error('Exception while parsing '+dirPath + fileName);
					generateScript(dirPath,fileName,json);
				});
			}catch(exception){
				console.log(exception);
			}
		}
	});
},
//Arguments mapper
argumentsMapper = require('./argumentsMapper.js'),
//XML to JSON parser
xmlToJson=require('./MTxmlParser.js'),
//Build script generator
clientScriptGenerator=require('./clientScriptGenerator.js'); //Client script generator; //xml parser object
//Map arguments and call after initialise
argumentsMapper.map(args,function(error,argsMap){
	initialize(argsMap,onInitialize);
});

