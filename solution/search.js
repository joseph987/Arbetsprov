/**
 * jQuery like syntax for selectors
 * Written just  for this task since pulling in jQuery was not clear if allowed and plain usage of querySelector is not flexible enough. Util methods needed.
 */
!function joQuery(){
        
        /** Default method operates on document **/
        window.$ = function(selector) {
                return $.call(document, selector);
        };
        function $(selector) {
                var
                        that    = this,
                        element = XY.Is.node(selector) ? selector : that.querySelector.apply(that, arguments)
                ;
                
                if ( !element ) return undefined;
                
                /************************
                Find from element instead of document. 
                Allows for recursion 

                Example: 
                     $('body').find('> main').find('> div')
                        -- which is the same as --  
                     $('body > main > div')
 
                 **********************/
                element.find = function(selector) {
                        // :scope currently has limited support so we make our own solution
                        var scope = element.nodeName; return $.call(element, scope + ' ' + selector);
                };
                
                return element;
        }
}();

/**
 * XY.js 
 * 
 * Is a core library and contains random useful and reusable functions for the use by all developed applications.  
 */
!function() {
        var XY = window.XY = {};
        
        XY.Request = {
                http : function (options) {
                        var     xhr        = new XMLHttpRequest(),
                                path       = options.url,
                                completefn = options.complete,
                                successfn  = options.success,
                                errorfn    = options.error,
                                async      = options.async !== false
                        ;
                        
                        xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4) {
                                        xhr.onreadystatechange = null;
                                        
                                        if (xhr.status === 200 || xhr.status === 0 ) {
                                                successfn.call(xhr, xhr.responseText);
                                        }
                                        else {
                                                xhr.onerror.apply(undefined, arguments);
                                        }
                                        
                                        completefn && completefn.call(xhr, xhr.responseText);
                                }
                        };
                        
                        var invoked = false;
                        errorfn && (xhr.onerror = function() {
                                if ( invoked ) return;  invoked = true;
                                
                                errorfn.call(xhr, xhr.responseText);
                        });
                        
                        // Relative paths in XMLHttpRequest is relative to the current location.href
                        xhr.open("GET", path, async);   // Defaults to true
                        
                        xhr.send(null);
                        
                        return xhr;
                }
        };
        
        XY.Events = {
                on : {
                        // element.addEventListener('DOMSubtreeModified', function() { ... }) is inconsistent and unreliable. 
                        // Firefox fires the event before element is actually removed
                        DOMSubtreeModified : function(element, fn) {
                                return new MutationObserver(function (event) {
                                        if ( (event = event[0]) && event.removedNodes || event.addedNodes ) {
                                                fn.call(this, arguments);
                                        }
                                }).observe(element, {childList:true});
                        }
                }
        };
        
        XY.Is = {
                node : function(o){
                        return typeof Node === 'object' ? o instanceof Node : o && typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName==='string';
                }
        };
}();

/**
 * App.js
 * 
 * Application wide logic. In this scenario it is code for the searching of movies. 
 */
!function() {
        
        var App = window.App = {};
        
        App.URL = {
                API : {
                        OMDB : 'http://www.omdbapi.com/?apikey=43f026e3&s={{QUERY}}'
                }
        };
        
        // Application specific date formatting
        App.Date = {
                format : function(date) {
                        return date.toISOString().substring(0, 16).replace('T', ' ');
                }
        };
}();

/**
 * Page specific logic. In this case search which is the entire Application. 
 * 
 * Execution of Javascript starts here when document is ready since elements can not be found until document is ready
 *
 * Note that I would not render nor create HTML like below, like in search() and favorites() but would use a client based template engine to do those things which I normally also have used.
 * 
 * The README.md states that only 3 files are to be handed in, and since what is ok and not ok to use is not clear, and communication is not possible, I assumed pulling in mustach, underscore, React, or Angular would be a bit of cheating 
 * since relying on third party libraries would be a violation of that. 
 * 
 * I've opted to use no libraries at all and rely doing it purely based on Javascript, HTML, and LESS/CSS.
 * 
 * When it comes to the less part, i see no real reason to having to actually type out everything in CSS but I've attached a compiled version, should you insist.
 * I have however utilized .less to generate the resulting CSS. 
 *   
 */
!function () {

        // Additional configuration option
        // Unless attribute max-font-size=false we rely on a max font size of 50px
        // Example -> http://localhost:63342/path/to/HM/UI/assets/search.html?max-font-size=false
        // When set to false, the page will grow as much as the width of the window requires, without any maximum size limitation
        // When not set, we will enforce a max size because at certain levels, it just gets too big. 
        // It is however responsive below those levels
        if ( ~location.href.indexOf('max-font-size=false') ) document.documentElement.setAttribute('max-font-size', false); 

        window.addEventListener('load', function() {
        
                var Elements = {
                        search    : search(),
                        favorites : favorites()
                };
                
                // #search element logic
                function search() {
                        var     search      = $('#search'),
                                input       = search.find('> input'),
                                suggestions = search.find('> .suggestions')
                        ;
                        
                        // On click on anywhere in the document except the actual input, we hide the suggestion box (including a click on the suggestion box itself) 
                        document.addEventListener('click', function(ev){
                                if ( ev.target !== input ) {
                                        suggestions.style.display = 'none';
                                }
                                
                        });
                        
                        // When we focus on the input, we wish to make the suggestions visible. If there are no chilren in suggestions, then nothing will be visible to the naked eye  
                        input.addEventListener('focus' , function(ev) {
                                suggestions.style.display = 'block';
                        });
                        
                        // Isolated group with variable for event on input change. Makes an API call, and updates the content of the suggestion box  
                        (function () {
                                
                                var MAX_SUGGESTIONS = 5, XHR;
                                
                                function create(title) {
                                        // Not really a fan of inline html in JavaScript
                                        var li = document.createElement('li');
                                        li.innerHTML = title;
        
                                        li.addEventListener('click', function() {
                                                Elements.favorites.toggle(title);
                                        });
        
                                        suggestions.appendChild(li);
                                }
                                
                                
                                input.addEventListener('input', function() {
                                        // Reset the suggestion box so that we can fill it from scratch, always.
                                        suggestions.innerHTML = '';
                                        
                                        // If xhr is still ongoing and change of input has occurred, the we wish to abort previously made request to issue a new one below
                                        if ( XHR ) XHR.abort();
                                        
                                        var value = input.value;
                                        XHR = XY.Request.http ({
                                                url     : App.URL.API.OMDB.replace('{{QUERY}}', value),
                                                
                                                complete : function() {
                                                        XHR = null;
                                                },
                                                
                                                success : function(data) {
                                                        /**
                                                         --------------------
                                                         Example incoming format
                                                         --------------------
         
                                                         {"Response":"False","Error":"Too many results."}
         
                                                         {
                                                                "totalResults":"3",
                                                                "Response":"True",
                                                                "Search":[
                                                                        {
                                                                         "Title":"SSS-body: Sekai saidai class no chônyû deep impact: Hitomi",
                                                                         "Year":"2013",
                                                                         "imdbID":"tt4991356",
                                                                         "Type":"movie",
                                                                         "Poster":"N/A"
                                                                        }
                                                                ]
                                                        }
                                                        */
                                                        
                                                        data = JSON.parse(data || '{}');
                                                        var movies = (data.Search || []), max = Math.min(movies.length, MAX_SUGGESTIONS), i = -1;
                                                        while ( ++i < max ) {
                                                                var movie = movies[i];
                                                                create(movie.Title);
                                                                
                                                        }
                                                },
                                                error   : function() {
                                                        console.log("error", this, arguments)
                                                }
                                        });
                                });
                                
                                return {};
                        })();
                }
                
                // #favorites element logic   
                function favorites() {
                        var
                                favorites       = $('#favorites'),
                                titles          = { /* contains movie title -> li element **/}
                        ;
                        
        
                        XY.Events.on.DOMSubtreeModified(favorites, function(ev) {
                                favorites.style.display = favorites.children.length > 0 ? 'block' : 'none'; // Toggle visibility 
                        });
                        
                        function remove(title) {
                                var li = titles[title];
                                delete titles[title];
                                li.remove();
                        }  
                        
                        function create(title) {
                                var li = titles[title] = document.createElement('li'), date = App.Date.format(new Date());
        
                                // Not really a fan of inline html in JavaScript
                                li.innerHTML = '' +
                                        '<div    class="title" >' + title + '</div>'   +
                                        '<div    class="date"  >' + date    + '</div>' +
                                        '<button class="close" ></button>'
                                ;
        
                                $(li).find('> button').addEventListener('click', function() {
                                        remove(title);
                                });
        
                                favorites.appendChild(li);
                        }
                        
                        function toggle(title) {
                                // Already exists in dom?  
                                title in titles ? remove(title) : create(title);
                        }
                        
                        // We make one function public to the outside context
                        return {
                               toggle : toggle 
                        };
                }
        });
        
        
}();