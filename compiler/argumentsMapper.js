var argumentsKeys = {
	FOLDER	:	{
		shortHand	:	'-d',
		fullName	:	'--directory',
		require		:	false,
		type		: 	'filepath'
	},
	FILE	:	{
		shortHand	:	'-f',
		fullName	:	'--file',
		require		:	false,
		type		: 	'filepath'
	},
	COMPILER_PROPERTIES	:	{
		shortHand	:	'-cprop',
		fullName	:	'--compileProperties',
		require		:	false,
		deflt		:	'./compilerProperties.js',
		type		: 	'filepath'
	},
	APPLICATION_PROPERTIES	:	{
		shortHand	:	'-aprop',
		fullName	:	'--appProperties',
		require		:	false,
		deflt		:	'./appProperties.js',
		type		: 	'filepath'
	}
},
findArgumentValue = function(argumentsList,argumentKey,onFound){
	var found = false,
	i = 0,
	argument;
	try{
		for(i; i< argumentsList.length; i++){
			argument = argumentsList[i];
			if(argument === argumentKey.shortHand || argument === argumentKey.fullName){
				found = true;
				onFound(false,true,argumentsList[++i]);
				break;
			}
		}
		if(!found)
			onFound(false,false);
	} catch(exception){
		console.log(exception);
	}
},
mapper = function(argumentsList,onArgumentsMapped){
	var compilerArgs = {},
	argumentsList = argumentsList || [],
	argumentKey;
	try{
		for(key in argumentsKeys){
			argumentKey = argumentsKeys[key];
			findArgumentValue(argumentsList,argumentKey,function(error,found,argumentValue){
				var value;
				if(found){
					value = argumentValue;
				} else if(argumentKey.deflt)
					value = argumentKey.deflt;
				if(value)
					compilerArgs[argumentKey.fullName] = value;
			});
		}
		onArgumentsMapped(false,compilerArgs);
	}catch(exception){
		console.log(exception);
	}
};
exports.map=mapper;
exports.compilerProperties = argumentsKeys.COMPILER_PROPERTIES.fullName;
exports.appProperties = argumentsKeys.APPLICATION_PROPERTIES.fullName;