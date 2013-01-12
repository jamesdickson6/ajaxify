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
Include *jquery.ajaxify.js* in your application's *<head>*
```html
<script type="text/javascript" src="/js/jquery.ajaxify-1.0.min.js"></script>
```

Make all elements with *class="ajaxLink"* load the *#mycontainer* element with the result of their *href?format=ajax*
```js
$(document).ajaxify(".ajaxLink", {update:"#mycontainer"})
```

Options for link handling come from the link itself!  (it's html attributes).

So render your links like this:
```html
<a class="ajaxLink" href="/mypage" update="#mycontainer" jsbefore="someFunction();" format="ajax">My Page</a>
```

Options specified on a link will take presedence over those passed to **.ajaxify()**

I've also written a tiny Grails TagLib for easy link rendering...

## Link Handling
The default behavior of **Ajaxify.defaultHandler** might be all you ever need.  
It supports lots of options.  Check out the [code](ajaxify/tree/master/jquery.ajaxify.js) to see what options (html attributes) might be useful to you.

You could write your own javascript handler function and use that instead. Like this:
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

You can easily customize the format parameter value:

```js
// change default
Ajaxify.defaultRequestFormat="div"
// use something other than default
$(document).ajaxify(".ajaxLink", {format : 'div'})
```
Or for a single link:
```html
<a ... format="div" ...></a>
```


