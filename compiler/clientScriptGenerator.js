/**
 * Add some important lines to the JSON to make it deliverable on the browser.
 * 'Cherry on top' :)
 * @param directory name - name of the directory to be used as a package
 * @param filename - name of the file
 * @param json - actual JSON instructions, generated after compile
 *
 *  @author avneesh
 */
function generate(directory,fileName,json,onGenerate){
    if(!directory || !fileName || !json){
        onGenerate('Please provide proper arguments.');
        return;
    }
    if(directory[directory.length-1]!=='/')
       directory+='/';
    _makeScript();
    
    function _makeScript(){
        var header='!function(W,D,$){var instructions=', //Header of the file
        footer=';W.rakkar.addInstructionSet("'+_getPackageName()+'",instructions);}(window,window.document,(window.Zepto || window.jQuery));';
        onGenerate(undefined,header+json+footer);
    }
    function _getPackageName(){
        var scriptSource=appProperties.appResource + directory + fileName;
        return jQuery.trim(scriptSource.replace(/\//g,'.'));
    }
}
exports.generate=generate;
