#!/bin/bash
compress(){
	java -jar yuicompressor-2.4.2.jar --type js --charset UTF-8 -o $2 $1
}
UIresources=../build/resources
for DIR in $(find $UIresources -name \* -type d)
do
	 if [ "$DIR" != "$UIresources" ]
	 then
	 for RawJS in $(find $DIR -name \*.js -type f)
	 do
	 fileName=`basename $RawJS`
	 compress $RawJS $RawJS
	 done
	 fi
done


