#!/bin/bash
#Script can execute on bash shell
BUILD_DIR=../build #compiled view directory
SCRIPTS_DIR=$BUILD_DIR/scripts 
#Scripts to be loaded on page load
LOAD_SCRIPTS=( DomGenerator.js boot.js )
# directory of plugins used
PLUGINS_DIR=../plugins
# name of all the plugins used in order of dependency
PLUGINS_SCRIPTS=( jquery.tipTip.js imgq.js )
# name of all the styles sheet used in order of dependency
STYLES=( css.css )
# compiled styles directory
STYLES_DIR=$BUILD_DIR/css
# temporary folder to keep final view
PROD_VIEW=./view
# compiled resources directory
RESOURCES_DIR=$BUILD_DIR/resources
# function to compress and minify javascript and css
# Signature- compress(fileToCompressPath,destFilePath,typeOfFile)
compress(){
    java -jar yuicompressor-2.4.2.jar --type $3 --charset UTF-8 -o $2 $1
}
# concat files from the given array to one single file
# Signature- concatFiles(arrayOfFileNames,parentDirOfArrayFiles,destFilePath)
concatFiles(){
     declare -a fileNames=("${!1}")
       
    for fileName in "${!fileNames[@]}"
       do
        cat $2/"${fileNames[$fileName]}" >> $3
    done
}
#concat and compress plugins in to one file
buildPluginsScript(){
  concatFiles PLUGINS_SCRIPTS[@] $PLUGINS_DIR $PROD_VIEW/dep.js
  compress $PROD_VIEW/dep.js $PROD_VIEW/dep-min.js js  
}
#concat and compress metataste onLoad scripts in to one file
buildLoadScripts(){
     concatFiles LOAD_SCRIPTS[@] $SCRIPTS_DIR $PROD_VIEW/MT.js
     compress $PROD_VIEW/MT.js $PROD_VIEW/MT-min.js js
}
#concat and compress metataste style sheest in to one file
buildStyles(){
    concatFiles STYLES[@] $STYLES_DIR $PROD_VIEW/styles.css
    compress $PROD_VIEW/styles.css $PROD_VIEW/styles-min.css css
}
#compress all resource files
buildResources(){
    `cp -r $RESOURCES_DIR $PROD_VIEW`
    local resources_dir=$PROD_VIEW/resources
    local fileName    
    for DIR in $(find $resources_dir -name \* -type d)
    do
        if [ "$DIR" != "$resources_dir" ]
        then
        for RawJS in $(find $DIR -name \*.js -type f)
          do            
             compress $RawJS $RawJS js
          done
         fi
     done

}
#Delete folder first if already exists
if [ ! -d "$PROD_VIEW" ]; then
    `rm -rf $PROD_VIEW`
fi
#create temporary folder to keep final build view
mkdir $PROD_VIEW
buildPluginsScript
buildLoadScripts
buildStyles
buildResources

