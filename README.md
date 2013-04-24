## rakkar.js - For awesome dynamic web applications.

Faster, modular, unobtrusive development.

Just call javascript methods from HTML elements and make your HTML templates more readable.

Example :

    <div id="somediv" class="getMyClass()" execPost="postProcess()" click="onClick"></div>

## salient features -
* Easy to use. Almost no learning curve.
* Separate javascript code from HTML templates.
* Pre-compiled. All the HTML templates are pre-compiled to native javascript instructions.
* Does all the heavy lifting.
  1. Load files automatically on demand.
  2. Cache HTML configurations for further use.
  3. Minify all the code.

## Usage -

### Write -

To make most out of HTML templates, rakkar rather helps you write configurations to create HTML fragments in XML files like any HTML file.

A sample XML file :

    <configs>
         <!-- Import javascript file to use -->
        <js>mytemplate.js</js>

        <config id="my-reusable-template">
           <div id="getMyId()" class="reusable-div">
             <h1 condition="isHeading()">getHeading()</h1>
             <p class="content">getContent()</p>
           </div>
        </config>
    </configs>

 mytemplate.js :
===================

    var instructions = {
      getMyId : function(data,$reusableDiv){
                 return data.reusablediv.id;
      },
      isHeading : function(data,$parent){
          if(data.heading === 'example')
                return true;
          return false;
      },
      getHeading : function(data,$heading){
               return data.div.heading;
      },
      getContent : function(data, $content){
                return data.div.content;
      }
    }
### Compile -
  Pre-compile your templates for faster use. Just use rakkar's node.js compiler.

    node compile.js -aprop myAppProperties.js

  *myAppProperties.js has 'source' and 'build' directory path of the application.

### Use on client - 
    window.rakkar.createHTML(path,options).done(function(htmlCollection){
      	deferred.resolveWith(deferred,[htmlCollection]);
    });

### * Options - 
    appendTo    - Element to which HTML is to be appended.
    contextData - Data object to be used in template.
    instnName   - Config id
    prefetch    - Prefetch the file
  
## Utilities -
* condition - Take decision, whether to create this element or not, in element's attribute itself.
* execPost - Assign post-processor on any element.
* execPre - Assign pre-processor on element (under testing).
* toolTip - Attach tipTip.js toolTip on element.
* data - Put data in element.
* repeat - It is a special tag to ease loop structures in HTML templates.

repeat Example :

    <ul>
      <repeat repeatArray="getItemsList()">
         <li>listItem.text</li>
      </repeat>
    </ul>


**Catches**
* **Dot Notation** - Dot(.)  is preserved to get value from javascript object in HTML templates. To have a real dot (.) in text, you will have to escape it using cap (^) symbol.

## Requirements -
* node.js to compile template on your machine.

## Who is using rakkar.js -
[metataste](http://metataste.com) - A movie search and recommendation engine.

----------------------------------------------------------------------
**Note**- Will provide more information and updates, as soon as possible.
