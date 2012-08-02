/**
 * Add some important lines to the json to make it deliverable on the browser.
 * Basically, "Cherry on top" :)
 * @param directory name - name of the directory to be used as a packae
 * @param filename - name of the file
 * @param json - actual json instructions, generated after compile
 *
 *  @author avneesh
 */
function generate(directory,fileName,json,onGenerate){
    if(!directory || !fileName || !json){
        onGenerate("Please provide proper arguments.");
        return;
    }
    if(directory[directory.length-1]!=='/')
       directory+="/";
    var properties=require("./buildProp.js").prop;
    var path=require("path");
    var $=require(properties.customMod+"/node_modules/jquery");
    _makeScript();
    function _makeScript(){
        var header="(function(){ var instructions="; //Header of the file
        var footer=";$.htmlBuilder.UIFunctions('"+_getPackageName()+"',instructions);})();"; //Footer of the file. A function to put object in cache
        onGenerate(undefined,header+json+footer);
    }
    function _getPackageName(){
        var scriptSource=properties.appResource+"/"+path.basename(directory)+fileName;
        return $.trim(scriptSource.replace(/\//g,"."));
    }
}
exports.generate=generate;
