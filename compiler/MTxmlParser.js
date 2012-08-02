/**
 *  Uses the xml file and it's helper javascript file and convert
 *  into a single instruction object, that is to be used by
 *  browser to generate HTML.
 *
 *  @author avneesh
 */
function parse(directory,file,MTPath,onParsed){
    if(!directory || !file){
        onParsed("Specify proper arguments");
        return;
     }
    if(directory[directory.length-1]!=='/')
        directory+="/";
   var fileReader=require("fs");
   var properties=require("./buildProp.js").prop;
  var $=require(properties.customMod+"/node_modules/jquery");
   var jsDom=require(properties.customMod+"/node_modules/jquery/node_modules/jsdom").jsdom;
   fileReader.readFile(directory+file,"UTF-8",function(error,xmlFile){ //Read xml file
        var xmlDoc=jsDom(xmlFile); //Convert string xml file to xml document using jsdom
        _convertToObject(xmlDoc,function(error,obj){ //Convert xml document to instruction object
            onParsed(error,obj);
        });
   }); 
   function _resolvePath(fileName){
    return MTPath[directory][fileName];
   }
   /**
    * Convert xml document in to the form, that is to be
    * deliver to the front-end javascript
    * @param xml document
    */
   function _convertToObject(xmlDoc,onConvert){
    var jsFileName=$(xmlDoc).find("js").text();
    var instructions={};
    if(!jsFileName)
        _convert();
    else{
        fileReader.readFile(directory+jsFileName,"UTF-8",function(error,jsFile){ //Read javascript helper file
            if(error)
                return;
            jsFile=$.trim(jsFile);
            jsFile=jsFile.substring(jsFile.indexOf("{"),jsFile.length-1);
            _convert(jsFile);
           });
    }
    function _convert(execs){
         _toInstructionObject(function(docObj){
              instructions["configs"]=docObj; //UI oriented object in configs property
              var instructionJson=JSON.stringify(instructions);
              onConvert(undefined,_addExecs(instructionJson));
          });
          function _addExecs(instructionJson){
            if(!execs)
            return instructionJson;
            instructionJson=instructionJson.substring(0,instructionJson.length-1);
           return  instructionJson+',"execs":'+execs+"}"; //UI helper functions in execs property
          }
    }
    /**
     *  Convert xml to json
     */
    function _toInstructionObject(onObjectConversion){
        var docObj={};
        $($(xmlDoc).find("config")).each(function(i,instnSet){
            _makeXmlInstruction(_cleanWhiteSpace(instnSet));
        });
        onObjectConversion(docObj);
        function _cleanWhiteSpace(node){
           for (var i=0; i<node.childNodes.length; i++){
            var child = node.childNodes[i];
            if(child.nodeType == 3 && !/\S/.test(child.nodeValue)){
                node.removeChild(child);
                i--;
            }
            if(child.nodeType == 1)
               _cleanWhiteSpace(child); 
           } 
           return node;
        }

        function _makeXmlInstruction(instructionSet){
            if(instructionSet.nodeName.toLowerCase()!=="config")
                return;
            var instnSetObj={};
            var instructionSetName=$(instructionSet).attr("id");
            if(!instructionSetName)
                return;
            instnSetObj["name"]=instructionSetName;
           var instnChildren=[];
           $($(instructionSet).children()).each(function(i,instnChild){
            instnChildren.push(_makeInstructionObject(instnChild));
           });
           if(instnChildren.length>0)
            instnSetObj["children"]=instnChildren;
            docObj[instructionSetName]=instnSetObj;


           function _makeInstructionObject(htmlInstnSet){
            var instnObj={};
            if(htmlInstnSet.nodeType===3){
                instnObj.name="textNode";
                instnObj["textvalue"]=htmlInstnSet.nodeValue;
           } else
                instnObj.name=htmlInstnSet.nodeName;
           var childInstructions=[];
           $(htmlInstnSet.childNodes).each(function(i,childNode){
            childInstructions.push(_makeInstructionObject(childNode));
           });
           var instnAttrs=htmlInstnSet.attributes;
           if(!instnAttrs)
           return instnObj;
           var attrObj={};
           var eventsObj={};
           $.each(instnAttrs,function(i,attribute){
            var attrName=attribute.nodeName;
            var attrValue=attribute.nodeValue;
            if(events[attrName]){
                eventsObj[attrName]=attrValue;
                return true;
            }    
            switch(attrName){
                case "append": $(attrValue.split(",")).each(function(i,instnId){
                    var config=$(xmlDoc).find("config#"+instnId);
                    $($(config).children()).each(function(i,appendInstn){
                        childInstructions.push(_makeInstructionObject(_cleanWhiteSpace(appendInstn)));
                    });
                });
                break;
                case "condition":
                case "data":
                case "execpre":
                case "execpost":
                case "tooltip":
                instnObj[attrName]=attrValue;
                break;
                default:attrObj[attrName]=attrValue;
            }
           });
           instnObj["events"]=eventsObj;
           instnObj["attributes"]=attrObj;
           if(childInstructions.length>0)
            instnObj["children"]=childInstructions;
           return instnObj;
        }
    }
   }
}
}
/**
 * All the jquery supported events
 * are defined here.
 * Compiler strictly check events from this
 * object.
 */
var events={
    "blur":'blur',
    "focus":'focus',
    "focusin":'focusin',
    "focusout":'focusout',
    "load":'load',
    "resize":'resize',
    "scroll":'scroll',
    "unload":'unload',
    "click":'click',
    "dblclick":'dblclick',
    "mousedown":'mousedown',
    "mouseup":'mouseup',
    "mousemove":'mousemove',
    "mouseover":'mouseover',
    "mouseout":'mouseout',
    "mouseenter":'mouseenter',
    "mouseleave":'mouseleave',
    "change":'change',
    "select":'select',
    "submit":'submit',
    "keydown":'keydown',
    "keypress":'keypress',
    "keyup":'keyup',
    "error":'error'
};
exports.parse=parse;
