## Ajaxify

This library makes the browser back/next navgiation work with an application that uses AJAX to load page content.
As well as make the browser address bar a usable representation of the current page.
For that reason,  your link URLs (href) should work without *format=ajax*. 
This makes the site nicely and easily degrade to plain old HTML.

This leverages browser support for html5's pushState.

See [CanIUse](http://caniuse.com/#feat=history) for current browser support.

Without browser support, the only consequence should be that the Back button won't reload content via ajax.

## PJAX

Ajaxify does something similar to [PJAX](See https://github.com/defunkt/jquery-pjax).

Consider using PJAX instead, which is more robust and has caching and other goodness.


## Dependencies
* [jQuery &#8805; 1.7.2](http://jquery.com/)

## Usage
Include the library
```html
<od:javascript src="jquery/jquery.ajaxify-1.0.min"/>
```

Ajaxify all the links with class="ajaxLink"
```js
$(document).ajaxify(".ajaxLink", {update:"#primary-content"})
```

Render your links with html attributes
```html
<a class="ajaxLink" href="/mypage" update="#mycontainer" jsbefore="someFunction();" format="ajax">My Page</a>
```

I've also written a grails TagLib to just this..

## Link Handling
The default behavior of **Ajaxify.defaultHandler** might be all you ever need.  
It supports lots of parameters.  Check out the code to see what options (html attributes) might be useful to you.

You can write your own javascript handler function and then use that instead. Like this:
```js
function myCoolHandler(state) { ... }
$(document).ajaxify(".ajaxCool", {handle: myCoolHandler})
```

Or customize a specific link:
```html
<a class="ajaxLink" handle="myCoolHandler">My Page</a>
```

NOTE: You don't have to use anchor tags, you can ajaxify any type of element.

## Rendering
Your web application will need to support **format=ajax** and render responses without their page layout.  
You can, of course, customize the format parameter value


