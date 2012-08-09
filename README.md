Rakkar
======

Rakkar helps you create and maintain a medium to big dynamic webapp in a clean and easy way.  It provides a great set of building blocks for typical dynamic JavaScript applications which generate HTML on the fly and use multiple Javascript files.

The idea behind Rakkar arose from a personal need which came up while we were working on the front-end of www.metataste.com, which is a reasonably big dynamic webapp. The business logic of Metataste was mixing up heavily with the HTML generation part. This made the code dirty and was a maintenance nightmare. Not only this, minifying and combining multiple Javascript files for deployment was a headache. 
If you are making a web or mobile app which generates HTML dynamically from JSON, then Rakkar is a great option . It has been in use for www.metataste.com for quite some time.

Here are some salient features :

Separate view from control in your code.
Package your entire application in an easy and clean manner
Integrated and minified view and control, for efficiency during runtime(less and smaller resources are downloaded)
Generate DOM on the fly from Javascript objects/JSON, via declarative and easy to write HTML like instructions
Easily control the structure of a generated HTML fragment using condition attribute
Attach events to generated DOM elements by simply declaring them as attributes in your HTML instruction(onClick, onHover etc)
Reuse HTML instruction fragments at multiple places.
Declare callbacks to be executed before or after a generated HTML element is created
Easy to write looping instructions for creation of HTML

Custom Tags and attributes for HTML generation and event management ---->

Condition (attribute)- Should have function in it's value which returns a Boolean value which decides whether the  HTML
                        Tag is to be generated or not.                        
execPre (attribute)- Should function as it's value. It passes an additional callback function to the it's value
                     function, which would have to be called after business logic processing.
execPost (attribute) - Should have function as it's value. It acts like a callback on particular tag creation. A tag is
                       supposed to be fully created, when all of it's children are created.
toolTip (attribute) - It Can have a String or function or javascript object '.' notation as it's value, to show fancy
                      toolTip over element. It uses tipTip.js jquery plugin.
data (attribute) - It Can have a String or function or javascript object '.' notation as it's value, to store any type
                   of data related to HTML element for further use.
repeat (tag) - It is a special type of tag to iterate over any array. It has a special attribute 'repeatarray', which
               can have a String or function or javascript object '.' notation as it's value, that returns an array to
               the tag. It is useful, in creating same HTML fragment for different items.

Files included has running demo. Lets have a look here:

      XML file should be like this:
      
                            
      <configs> <!-- Super parent tag like <html> in .html file, which contains all type of tags.-->
         <js>home.js</js> <!-- Helper javascript file, which has helper functions for this xml -->                                                                             
         <config id="home-container">  <!-- HTML fragments are defined in config tags. A file can have any number of      
         config tags. A config tag must have an unique Id. You are free to call any config at any time. It will give you
         HTML fragment defined in this. --> 
         
        <div id="container">
            <h1>rakkar home</h1>        

            <div class="nested-container-sample"  condition="isNestedContainer()">                
                <span class="nested-element" click="dosomething"></span> <!--The tag got click event attached to it.
                Wait!! 'dosomething' is a function written here with no paranthesis, as we normally do with events.
                -->
             </div>
        </div>
       </config> <!--Another config tag. -->                            
          <config id="repeat-sample">
              <div id="repeat-sample">                  
                   <repeat  repeatarray="getItemArray()"> <!-- 'getItemArray()' here is a function which returns an
                   array. Lets say [{name:"Banana", value:1},{name:"Mango",value:2}] -->
                   
                       <span>item.name</span> <!-- This tag will be created twice, one for each element.Item here is the
                       object from array, and we are accessing the name property. We could also have used 'getItemElem'
                       function here, defined in helper javascript instead of '.' notation-->
                    </repeat>
              </div>
          </config>
      </configs>
      Javascript helper file defined in XML file header should be like this:
      
      var instructions={ //An object to keep, helper functions and events used in xml
                            //Context data here refers to any javascript object passed, to be used for html creation
                            // Currently proecessing element is the currentElement
                            
                            isNestedContainer: function(contextData,currentElement){
                                                     return true;  
                                                },
                            getItemArray: function(contextData,currentElement){
                                                return contextData.items;
                                            },
                                            
                             //Context data for this function would be an item
                             //of array,because it is running under repeat tag
                             
                            getItemElem: function(item){
                                            return item.name;
                                         }
                        }




----------------------------------------------------------------------
Note- Will provide more information and updates, as soon as possible.
