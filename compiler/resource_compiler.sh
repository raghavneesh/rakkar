#!/bin/bash
source=../src

compile(){
    node compile.js $1 $2 
}
for DIR in $(find $source -name \* -type d)
do
    if [ "$DIR" != $source ]
    then
        for configXML in $(find $DIR -name \*.xml -type f)
        do
            configXML=`basename $configXML`
            compile $DIR/ $configXML
        done
    fi
done
