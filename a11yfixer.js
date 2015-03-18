/**
 * This script itterates across objects containing selectors and respective fixes for
 * said selectors. It has support for individual URIs for page-specific fixes, site-wide
 * fixes, and universal fixes (fixes regardless of URI).
 * 
 * @author Sina Bahram (sina@sinabahram.com) and Greg Kraus (Greg Kraus <gdkraus@ncsu.edu>)
 */

/**
 * Dependencies: jQuery must already be loaded
 */

/**
 * JSON Format
 * 'development' = development servers, so rules can be written for production servers
 * but run seamlessly on other servers like development, staging, testing, etc.
 * 'development server': 'production server',
 *
 * '*' = fixes which apply to any page, regardless of URI
 * 
 * 'domain.com' = fixes which apply to a whole domain
 * 
 * 'domain.com/content' = fixes which apply to a specific page
 *
 * 'selector' = jQuery formatted selector string. Not a jQuery object, simply the
 * selector string. For example "h1" is correct. "jQuery('h1')" is not correct.
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
    '*': [
        {
            'selector': 'body',
            'action': function (selectorObj) {
                selectorObj.prepend('<p>This will be written to every page, regardless of URI.</p>');
                return true; // return true if the fix succeeds
            }
        }
    ],
    'a.com': [
        {
            'selector': 'img#logo',
            'action': function (selectorObj) {
                selectorObj.attr('alt', 'Acme Inc.');
                return true;
            }
        }
    ],
    'a.com/content': [
        {
            'selector': 'img#banner',
            'action': function (selectorObj) {
                selectorObj.attr('alt', 'co-workers discussing around a table');
                return true;
            }
        },
        {
            'selector': 'div#clickableHeading',
            'action': function (selectorObj) {
                selectorObj.attr('tabindex', '0');
                return true;
            }
        }

    ]
};
 
 */

var jQueryRan = false;
var jQueryRunAttempts = 0;

/**
 * JSON of fixes
 */
var fixesForPages = {
    'development': {
        'dev.a.com': 'a.com'
    },
    '*': [
        {
            'selector': 'body',
            'action': function (selectorObj) {
                selectorObj.prepend('<p>This gets inserted on every single page, complements of the accessibility fairy.</p>');
                return true; // return true if the fix succeeds
            }
        }
    ],
    'a.com': [
        {
            'selector': 'body',
            'action': function (selectorObj) {
                selectorObj.prepend('<p>This gets added to every page within the accessibility.oit.ncsu.edu domain, complements of the accessibility fairy.</p>');
                return true; // return true if the fix succeeds
            }
        }
    ],
    'a.com/about.html': [
        {
            'selector': 'h2',
            'action': function (selectorObj) {
                selectorObj.html(selector.html() + '... accessibility fairy dust in your heading');
                return true;
            }
        },
        {
            'selector': 'img',
            'action': function (selectorObj) {
                selectorObj.attr('alt', 'The accessibility fairy has taken over your alt text.');
                return true;
            }
        }
    ]
};

// get the current URL
var host = window.location.host; // extract the domain
var page = window.location.href.toString().split(host)[1]; // extract the part after the first slash

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
        console.log("Running in debug mode as development site for '" + devSite + "'");
    } else {
        // running on production site
        ALERTS = false;
    }
    break;

case DEBUG_FORCE_OFF:
    ALERTS = false;
    console.log("debug forced off");
    break;

case DEBUG_FORCE_ON:
    ALERTS = true;
    console.log("debug forced on");
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

    iterateFixes(json, '*'); // apply 'run always' changes
    iterateFixes(json, host); // apply domain-wide changes
    iterateFixes(json, host + page); // apply page specific changes

}

/**
 * This function iterates over a set of fixes for a given scope. If the selector returns
 * an empty set, indicating a selector could not find its target, an error message
 * is generated.
 */
function iterateFixes(json, scope) {
    // grab all of the fixes based on the scope (URI)
    var fixes = json[scope];
    // if fixes exist for a page
    if (typeof fixes !== 'undefined') {
        // iterate over the fixes
        for (var i = 0; i < fixes.length; i++) {
            var f = fixes[i];
            //try {
                var selector = $(f.selector);
                // if selector returns a set of matched elements
                if (selector.length != 0) {
                    // success
                    // execute the function
                    if (!f.action(selector)) {
                        // failure - action failed
                        error(scope, f, i);
                    } else {
                        // success
                        jQueryRan = true;
                        if (ALERTS) {
                            console.log('SUCCESS: Fix number ' + parseInt(i + 1) + ' for page "' + scope + '" (Selector: "' + f.selector + '")');
                        }
                    }
                } else {
                    // failure - jQuery selector failed
                    error(scope, f, i);
                }
        }
    }
}

/**
 * Error reporting function
 * Errors are either sent to the console or to both the console and an alert window,
 * which is determined by the DEBUG state. Use DEBUG_MODE to force a particular
 * DEBUG state.
 */
function error(scope, fix, fixCount) {
    var msg = 'FAILED: Fix number ' + parseInt(fixCount + 1) + ' for page "' + scope + '" (Selector: "' + fix.selector + '")';
    console.log(msg);
    if (ALERTS) {
        alert(msg);
    }
}

/**
 * This allows us to execute after the dom and everything else has loaded
 */
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            if (oldonload) {
                oldonload();
            }
            func();
        };
    }
}

addLoadEvent(a11yFixer(fixesForPages));
