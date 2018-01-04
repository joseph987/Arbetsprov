# Search API implementation for movie titles

* URL used: http://www.omdbapi.com/?apikey=KEY&s={{QUERY}}

* **solution/** is the folder containing only the requested files

* **assets/** is the folder containing the folders and structure I actually used in development. Main **difference** between the development environment is the use of a different **file structure**, use of **search.less**, and small difference in **search.html**. 

* **Less** was used to generate the **CSS** because doing it purely in CSS would be redundancy nightmare. The generated CSS is in the **solutions/** directory.

* The JS file **search.js** contains all JS code but ideally that code would be structured in several files, but has been structured in search.js in a way to allow for easy extraction but has been delivered as requested, in one single file.

## Additional options
* Default includes a limit on how big the scaling up can go which can become ridiculously big for big screens
        
        ../path/to/solution/search.html
        
   [ Live link (Click me!) ](http://rawgit.com/joseph987/Arbetsprov/joseph-feature-branch/solution/search.html)
        
  where a **cap** has been introduced at **1440px** meaning the **scaling up stops** there. 
  
* However, for fully responsive layout relative to width according to the "specification", use the following url

        ../path/to/solution/search.html?max-font-size=false
        
    [ Live link (Click me!) ](http://rawgit.com/joseph987/Arbetsprov/joseph-feature-branch/solution/search.html?max-font-size=false)

    For **unlimited scaling up & down** when **window width changes**. 
  
## Other  
* No template engine was used, but the little html generated was created using JS and document.createElement. 
* No jQuery, or Sizzle or the like was used, but created a j**o**Query function that mimics jQuery **$** function and implemented a **find** function for subselects from element.
* Nothing was actually mentioned regarding the font, so the icons are not exacly rendered as in the UI. Knowing the font would have helped fix that. I'm sure it's a minor detail. The SVG files was kept and not bundled in the CSS or HTML. 
