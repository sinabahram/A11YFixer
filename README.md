# A11YFixer

This script iterates across objects containing selectors and respective fixes for
said selectors. It has support for individual URIs for page-specific fixes, directory-wide
fixes, and universal fixes (fixes regardless of URI).

@author Sina Bahram (sina@sinabahram.com) and Greg Kraus (Greg Kraus <gregorydkraus@gmail.com>)
 


Dependencies: none
 


jQuery Note: Functions in a11yfixer.js should refer to the jQuery object using jQueryA11y. This ensures
that if jQuery is already loaded on the page, the version of jQuery that a11yfixer.js uses will
not conflict with the already installed jQuery.
 


JSON Format
'development' = development servers, so rules can be written for production servers
but run seamlessly on other servers like development, staging, testing, etc.
'development server': 'production server',

'universal' = fixes which apply to any page, regardless of URI

'wildcard' = fixes which apply to a whole folder

'specific' = fixes which apply to a specific page

'selector' = jQuery formatted selector string. Not a jQuery object, simply the
selector string. For example "h1" is correct. "jQuery('h1')" is not correct.

'description' = A brief description of the modification. This description will be printed to the console and error messages

'status' = This should be set to 'false' if you want the modification to run. The script uses this variable
to track if a modification has successfully run. Manualy setting it to 'true' will disable the modification.
 *jQueryIA11Y
'action' = function which transforms the results returned by the jQuery selector
string. This function should return true or false depending on if it ran successfully.
A precheck is done to ensure the jQuery selector string returns results, so the action
function does not need to perform this check. If no results are returned from a 
jQuery selector, an error is generated.
'action': function(selector){selector.attr('alt','I added some alt text.'); return true;}
 


Sample JSON Format
 
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
                    selectorObj.html(selector.html() + '... accessibility fairy dust in your heading');
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
 
