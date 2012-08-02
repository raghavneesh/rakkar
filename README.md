rakkar
======

rakkar is a  web framework to create dynamic HTML in a fastest and easiest way. 
Keep even a small part of your HTML fragment separate from others, and reuse the same HTML fragment with different type of context data, as much as you want.
Call javascript functions and attach events, while writing HTML code. Custom attributes like condition, toolTip, data are cherry on top :) . Fetch page resources
on demand only.
Export minify files for production.

It compiles the code you write at server itself and create a build for you to be deployed on your server.


Install-
1. Checkout the repository
2. Install node.js v0.4.11 (I've run on this version for now)
3. Install npm, jsdom and jquery on your development machine
4. just put your local configurations in buildProp.js and you are all set :)
5. Make a folder in src folder for your custom page. See home folder for
   reference.
6. XML file contains the HTML code, while javascript file contains helper
   methods.
7. Structure for files explained as below:

    a. home.xml ------> 
                            <!-- Super parent tag like <html> in .html file, which contains all type of tags.-->
                            <configs>
                            <js>home.js</js>
                            <!-- A file can have many config tags, as each
                            config tag contains HTML fragments, that can be
                            generated dynmaically. Each config tag has an id -->

                            <config id="home-container">
                                <!-- Write any html code you want -->
                                <div id="container">
                                    <h1>rakkar home</h1>
                                    <!-- div element has custom attribute condition here, which is a function
                                    defined in javascript helper file, included
                                    at the top of this xml file. This function
                                    returns boolean value. If return value is
                                    false/undefined/null, this element with
                                    it's child element would not be created -->

                                    <div class="nested-container-sample"  condition="isNestedContainer()">
                                        <!--Span tag got click event attached to it. Wait!! function given in this tag
                                            does not have paranthesis :) 
                                        -->
                                        <span class="nested-element" click="dosomething"></span>
                                     </div>
                                </div>
                            </config>

                            <!--Another config tag. -->
                            <config id="repeat-sample">
                                <div id="repeat-sample">
                                    <!--repeat tag will repeat all the elements
                                    in it for all the items in an array.
                                    "repeatarray" attributes calls a function
                                    defined in javascript helper file, that
                                    would return an array to it-->
                                     <repeat  repeatarray="getItemArray()">
                                        <!--Span element here will get it's
                                        value from the function, depending on
                                        the context object passed -->
                                         <span>getItemElem()</span>
                                      </repeat>
                                </div>
                            </config>
                        </configs>

    b. home.js -----> var instructions={ //An object to keep your instructions
                            //Context data is any data, you passed for html creation
                            // html element is current element
                            isNestedContainer: function(contextData,currentElement){
                                                     return true;  
                                                },
                            getItemArray: function(contextData,currentElement){
                                                return contextData.items;
                                            },
                             //Context data for this function would be an item
                             //of array,because it is running under repeat tag
                            getItemElem: function(itemName){
                                            return itemName;
                                         }
                        }

8. Once you are done with writing your source code, build this xml file using
   command "node compile.js file-path". This command will convert all this
   stuff in a single javascript file and would place it in build/resources.
   Or you can alternatively build source files for all the folders by using a
   utility script resource_compiler.sh

9. Now, if you want to host in your production environment, goto export folder
  run command "bash export.sh". It will concat and minify all the css, all the
  javascript files in scripts folder and will minify all javascript in each
  folder.Or you can alternatively run resource_minifier.sh to just minify your
  javascript in resources folder.
10. DomGenerator.js should be included in your HTML file to convert all this in
    to HTML on fly.



Custom Tags and attributes---->
--------------------------
1. Condition (attribute) - If the value returned by function is true, the tag
   will be generated, otherwise not.
2. execPre (attribute)- Function define for it, also take a callback function
   with contextdata and currentElement. This function is executed, before the
   element is created.
   Note: You've to explicitly call the callback function in this.
3. execPost (attribute) - Function assigned to this will be get called,
   immediately after the element and all of it's children are created.
4. toolTip (attribute) - Can be a String or function to show fancy toolTip over
   element
5. data (attribute) - Data returned by function assigned to this, will be
   stored in "cdata" property, which can later be accessed using jquery's data
   function.
6. repeat (tag) - Iterates over the array provided in repeatarray attribute,
   and repeat the HTML fragment inside it, for all the elements in array

----------------------------------------------------------------------
Note- Will provide more information and updates, as soon as possible.
