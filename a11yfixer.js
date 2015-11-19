/**
 * This script iterates across objects containing selectors and respective fixes for
 * said selectors. It has support for individual URIs for page-specific fixes, directory-wide
 * fixes, and universal fixes (fixes regardless of URI).
 * 
 * @author Sina Bahram (sina@sinabahram.com) and Greg Kraus (Greg Kraus <gregorydkraus@gmail.com>)
 */

/**
 * Dependencies: none
 */

/**
 * jQuery Note: Functions in a11yfixer.js should refer to the jQuery object using jQueryA11y. This ensures
 * that if jQuery is already loaded on the page, the version of jQuery that a11yfixer.js uses will
 * not conflict with the already installed jQuery.
 */

/**
 * JSON Format
 * 'development' = development servers, so rules can be written for production servers
 * but run seamlessly on other servers like development, staging, testing, etc.
 * 'development server': 'production server',
 *
 * 'universal' = fixes which apply to any page, regardless of URI
 * 
 * 'wildcard' = fixes which apply to a whole folder
 * 
 * 'specific' = fixes which apply to a specific page
 *
 * 'selector' = jQuery formatted selector string. Not a jQuery object, simply the
 * selector string. For example "h1" is correct. "jQuery('h1')" is not correct.
 *
 * 'description' = A brief description of the modification. This description will be printed to the console and error messages
 *
 * 'status' = This should be set to 'false' if you want the modification to run. The script uses this variable
 * to track if a modification has successfully run. Manualy setting it to 'true' will disable the modification.
 *
 * 'action' = function which transforms the results returned by the jQuery selector
 * string. This function should return true or false depending on if it ran successfully.
 * A precheck is done to ensure the jQuery selector string returns results, so the action
 * function does not need to perform this check. If no results are returned from a 
 * jQuery selector, an error is generated.
 * 'action': function(selector){selector.attr('alt','I added some alt text.'); return true;}
 */

/**
 * Sample JSON Format
 
var fixesForPages = {
    'development': {
        'development.a.com': 'a.com',
        'testing.a.com': 'a.com',
        'staging.a.com': 'a.com'
    },
    'universal' :{
        '*': [
            {
                'selector': 'body',
                'description' : 'Adds text to every page on the Web',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.prepend('<p>This gets inserted on every single page, complements of the accessibility fairy.</p>');
                    return true; // return true if the fix succeeds
                }
            }
        ],
    },
    'wildcard' :{
        'a.com': [
            {
                'selector': 'body',
                'description' : 'Adds text to every page in the site',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.prepend('<p>This gets added to every page within the accessibility.tools domain, complements of the accessibility fairy.</p>');
                    return true; // return true if the fix succeeds
                }
            }
        ],
        'a.com/demos/': [
            {
                'selector': 'body',
                'description' : 'Adds text to anything in demos directory',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.prepend('<p>Limited scope</p>');
                    return true; // return true if the fix succeeds
                }
            }
        ],
    },
    'specific' :{
        'a.com/page.html': [
            {
                'selector': 'h2',
                'description' : 'Modifies the heading',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.html(selectorObj.html() + '... accessibility fairy dust in your heading');
                    return true;
                }
            },
            {
                'selector': 'img',
                'description' : 'Changes the alt text',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.attr('alt', 'The accessibility fairy has taken over your alt text.');
                    return true;
                }
            }
        ]
    }
};
 
*/


/**
 * JSON of fixes
 */
 var fixesForPages = {
    'development': {
        'qa.accessibility.tools': 'accessibility.tools',
        'testing.accessibility.tools': 'accessibility.tools',
        'dev.accessibility.tools': 'accessibility.tools'
    },
    'universal' :{
        '*': [
        {
            'selector': 'body',
            'description' : 'Adds text to every page on the Web',
            'status': false,
            'action': function (selectorObj) {
                selectorObj.prepend('<p>This gets inserted on every single page, complements of the accessibility fairy.</p>');
                    return true; // return true if the fix succeeds
                }
            }
            ],
        },
        'wildcard' :{
            'accessibility.tools': [
            {
                'selector': 'body',
                'description' : 'Adds text to every page in the site',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.prepend('<p>This gets added to every page within the accessibility.tools domain, complements of the accessibility fairy.</p>');
                    return true; // return true if the fix succeeds
                }
            }
            ],
            'accessibility.tools/demos/': [
            {
                'selector': 'body',
                'description' : 'Adds text to anything in demos directory',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.prepend('<p>Limited scope</p>');
                    return true; // return true if the fix succeeds
                }
            }
            ],
        },
        'specific' :{
            'accessibility.tools/accessibleu.html': [
            {
                'selector': 'h2',
                'description' : 'Modifies the heading',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.html(selectorObj.html() + '... accessibility fairy dust in your heading');
                    return true;
                }
            },
            {
                'selector': 'img',
                'description' : 'Changes the alt text',
                'status': false,
                'action': function (selectorObj) {
                    selectorObj.attr('alt', 'The accessibility fairy has taken over your alt text.');
                    return true;
                }
            }
            ]
        }
    };


/**
 * Second Attempt
 * Set secondAttempt to 'true' if you want to attempt to apply the changes a second time. It will only 
 * attempt to reaply the patch if the first attempt failed. This is useful if there will be asynchronous
 * chnages to the page that will also need modifications.
 *
 * Set the TIMEOUT_RETRY to the delay in miliseconds before the second attempt is made.
 */
 var secondAttempt = false;
var TIMEOUT_RETRY = 5000; // time in milliseconds to reattempt the changes

/**
 * DEBUG Mode
 * DEBUG_MODE dictates where error messages are output when fixes fail to apply. By
 * default, when running on the defined production server, output is directed to the
 * console. When the script is run on a development server the output is directed to both
 * an alert message and the console. This is to alert developers when modifictions to
 * pages cause previous fixes to stop working.
 *
 * There are three states for DEBUG_MODE.
 *
 * DEBUG_DEFAULT = output errors to the console for the production server and console
 * and alert windows for non-production servers
 * DEBUG_FORCE_OFF = restrict output to the console only (useful when an error is known
 * but you don't want the alert windows constantly popping up)
 * DEBUG_FORCE_ON = always send output to the console and alert windows, no matter what
 * server is being used
 */

// get the current URL
var host = window.location.host; // extract the domain
var page = window.location.href.toString().split(host)[1]; // extract the part after the first slash

/**
 * CONSTANTS
 */
 var DEBUG_DEFAULT = 0;
 var DEBUG_FORCE_OFF = 1;
 var DEBUG_FORCE_ON = 2;

// Edit this line to change the DEBUG mode
var DEBUG_MODE = DEBUG_DEFAULT;

var ALERTS = false;
switch (DEBUG_MODE) {
    case DEBUG_DEFAULT:
    // check if running in a development environment. If so, enable DEBUG_MODE
    var devSite = fixesForPages.development[host];
    if (typeof devSite !== 'undefined') {
        // running in development mode
        ALERTS = true;
        host = devSite;
        writeToConsole("Running in debug mode as development site for '" + devSite + "'");
    } else {
        // running on production site
        ALERTS = false;
    }
    break;

    case DEBUG_FORCE_OFF:
    ALERTS = false;
    writeToConsole("debug forced off");
    break;

    case DEBUG_FORCE_ON:
    ALERTS = true;
    writeToConsole("debug forced on");
    break;

    default:
    ALERTS = false;
    break;
}

/**
 * This function runs rules for
 * 1. 'run always' rules
 * 2. domain-wide rule
 * 3. page specific rules
 */
 function a11yFixer(json) {

    iterateFixes(json['universal'], '*', false); // apply 'run always' changes
    iterateFixes(json['wildcard'], host + page, true); // apply domain-wide changes
    iterateFixes(json['specific'], host + page, false); // apply page specific changes

    // Make a second pass at attempting the fixes after a given time frame. This allows for
    // asynchronous calls to finish firing before attempting again.
    if (secondAttempt){
        secondAttempt = false;
        setTimeout(run, TIMEOUT_RETRY);
    }

}

/**
 * This function iterates over a set of fixes for a given scope. If the selector returns
 * an empty set, indicating a selector could not find its target, an error message
 * is generated.
 */
 function iterateFixes(json, scope, wildcard) {
    // grab all of the fixes based on the scope (URI)
    if(wildcard) {
        var fixes = findPages(json, scope);
    } else {
        var fixes = json[scope];
    }
    // if fixes exist for a page
    if (typeof fixes !== 'undefined') {
        // iterate over the fixes
        for (var i = 0; i < fixes.length; i++) {
            var f = fixes[i];
            if(!f.status) { 
                var selector = jQueryA11Y(f.selector);
                // if selector returns a set of matched elements
                if (selector.length != 0) {
                    // success
                    // execute the function
                    if (!f.action(selector)) {
                        // failure - action failed
                        error(scope, f, i);
                    } else {
                        // success
                        f.status = true; // mark that the action executed
                        if (ALERTS) {
                            writeToConsole('SUCCESS: Fix for page "' + scope + '" (Task: "' + f.description + '")');
                        }
                    }
                } else {
                    // failure - jQuery selector failed
                    error(scope, f, i);
                }
            }
        }
    }
}

function findPages(json, url) {
    var fixes = [];
    var i = 0;
    for (var j in json) {
        if(json.hasOwnProperty(j)) {
          var page = Object.keys(json)[i]
          i++;
          if(page==url.substring(0,page.length)){
            fixes = fixes.concat(json[j]);
        }
    }   
}

return fixes;
}


/**
 * Error reporting function
 * Errors are either sent to the console or to both the console and an alert window,
 * which is determined by the DEBUG state. Use DEBUG_MODE to force a particular
 * DEBUG state.
 */
function error(scope, fix, fixCount) {
    if (!secondAttempt){
        var msg = 'FAILED: Fix for page "' + scope + '" Task: "' + fix.description + '"';
        writeToConsole(msg);
        if (ALERTS) {
            alert(msg);
        }
    }
}

function writeToConsole(m) {
    if (window.console) {
        console.log(m);
    }
}

function run() {
    a11yFixer(fixesForPages);
}

/**
 * Make sure a11yfixer.js is the last function to run when the page is loaded.
 * From: https://thechamplord.wordpress.com/2014/07/04/using-javascript-window-onload-event-properly/
 */

function myFunctionLoadEvent(func) {
    if (document.readyState === 'complete') {
        func();
    } else {
        // assign any pre-defined functions on 'window.onload' to a variable
        var oldOnLoad = window.onload;
        // if there is not any function hooked to it
        if (typeof window.onload != 'function') {
            // you can hook your function with it
            window.onload = func
        } else { // someone already hooked a function
            window.onload = function () {
                // call the function hooked already
                oldOnLoad();
                // call your awesome function
                func();
            }
        }
    }
}

// load jQuery and wait for it to be loaded, then execute the function
if (typeof jQueryA11Y == 'undefined') {  
    // jQuery is already loaded
    (function () {

        function loadScript(url, callback) {

            var script = document.createElement("script");
            script.type = "text/javascript";

        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    loadScript("//code.jquery.com/jquery-1.11.3.min.js", function () {

         //jQuery loaded
         jQueryA11Y = jQuery.noConflict( true );
         //myFunctionLoadEvent(a11yFixer(fixesForPages));
         myFunctionLoadEvent(run);
    });
    })();

} else {
    //myFunctionLoadEvent(a11yFixer(fixesForPages));
    myFunctionLoadEvent(run);
}


