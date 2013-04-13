rakkar
======
**(Just another HTML Templating Framework, not)**

rakkar helps you create a **clean**, **dynamic** and **maintainable** web application in easy way. 

Here are some salient features :

* **Expressive** - Write your javascript code where it belongs (in a javascript file). Why should you be using '{}', '<%= %>', '#' or '${}' while writing "HTML fragments". Apart from this, custom attributes and tags are really handy and let you write unobtrusive modular code.

* **Precompiled** - Precompile HTML code in minified javascript. Give browser your instructions in native javascript Object. Uses node.js to compile code.

* **Load on demand** - You don't have to worry about loading template. Just tell the path and rakkar does it for you, if instructions are not available in browser.

* **Scope** - Each module runs in it's own scope, while sharing module level data across templates.

* **Event handling** - Bind events while creating the element

### Custom Tags and attributes  ---->

* **Condition** (attribute)- Decide whether this HTML element needs to be created or not.

* **execPre** (attribute)- Pre-processor for HTML element. Execute a method provided as it's value to accomplish tasks required before creating this HTML element.

* **execPost** (attribute) - Postprocessor for HTML element. Execute method provided as it's value to execute task after HTML element get created.

* **toolTip** (attribute) - Give your element a fancy toolTip by using jQuery tipTip.js

* **data** (attribute) - Attach data to your element using jQuery data.

* **repeat** (tag) - Loop through the given array and create the child HTML fragment for all the items in array.

**Catches**
* **Dot Notation** - We have preserved dot notation to get value from javascript object in text node. To have a real dot (.) in text, you will have to escape it using cap (^) symbol.

**Requirements**
* node.js to compile template on your machine.
* XML file to write HTML fragment.

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
**Note**- Will provide more information and updates, as soon as possible.
