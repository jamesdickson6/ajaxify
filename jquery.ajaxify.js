//  jquery.ajaxify.js
//  https://github.com/sixjameses/ajaxify
//  author: jdickson@bertramcapital.com

var Ajaxify = {
  version : '1.0',

  defaultRequestFormat : 'ajax',
  isInitialized : false,
  isHandling : false, // handling link actions?
  isPushing : false, // back button support

  //set to true to print encountered errors
  debug : false,
  logMessage : function(msg) {
    if (this.debug) {
      if (false && window.console && window.console.log) window.console.log(msg)
      else alert(msg)
    }
  },

  //initialize Ajaxify library, hijack browser popstate
  init : function() {
    if (Ajaxify.isInitialized) return true //don't need to do this more than once
    try {
      if (window.history && window.history.pushState) {
	
	// Make the back button work for ajax links
	// Used to detect initial (useless) popstate.
	// If history.state exists, assume browser isn't going to fire initial popstate.
	var isPopped = (window.history.state && window.history.state.href)
	var initialURL = location.href

	// popstate handler takes care of the back and forward buttons
	$(window).bind('popstate', function(event){
	  // Ignore inital popstate that some browsers fire on page load
	  var initialPop = !isPopped && location.href == initialURL
	  isPopped = true
	  if (initialPop) return
	  
	  //try to handle our ajax state, or else use default browser behavior
	  var state = history.state || event.state
	  if (state) {
	    Ajaxify.handle(state)
	  }
	  else {
	    //this makes the back button work, albeit not via ajax, do what the browser would have done..
	    window.location = location.href
	  }
	})

	Ajaxify.isPushing = true
      } //end if pushState supported

    } catch(e) {
      Ajaxify.logMessage("error during ajaxify initialization: " + e)
    }
    Ajaxify.isHandling = true //not used right now
    Ajaxify.isInitialized = true
  },

  // Call this on a container of elements to have them handle clicks in an ajaxified way
  // selector is optional, and a way to operate on descendants
  // and options can be passed in its place
  // Exported as $.fn.ajaxify
  // Example Usage: 
  //  $(document).ajaxify(".ajaxLink", {update: '#container'})
  //  $("body .ajaxLink").ajaxify({update: '#container', handle : yourSpecialHandler})
  //  $("body .ajaxLink").ajaxify()
  ajaxify : function(selector, options) {
    if (!Ajaxify.isInitialized) Ajaxify.init()
    //Ajaxify.logMessage('called ajaxify('+selector+', '+options.toString())
    if (!options && (typeof selector == "object")) options = selector
    //add click event to elements

    return this.on('click.ajaxify', selector, function(event) {
      var opts = $.extend({}, (options||{}), Ajaxify.extractElementAttributes(this))

      var doAjaxify = (opts.ajaxify != 'no') // ajaxify="no" means dont ajaxify this link
      
      // Middle click, cmd click, and ctrl click should use browser default behavior
      if ( event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey )
	return
	
      if (!doAjaxify)
	return

      if (Ajaxify.isPushing) {
	opts.push = opts.push || 'push'
	if (opts.replace) push = 'replace'
	if (opts.push=='push' || opts.push=='yes') history.pushState(opts, '', this.href)
	else if (opts.push=='replace') history.replaceState(opts, '', this.href)
	// any other value of push means don't push it
      }

      Ajaxify.handle(opts) // handle this link

      event.preventDefault() //jQuery way to prevent default behavior
      return false // oldschool way to prevent default behavior
    })
  },

  // extract element attributes to Object
  // elm is a DOM Element or the ID of one
  extractElementAttributes : function(elm) {
    try {
      if (typeof(elm) == "string") {
	if (elm[0] == "#") elm = elm.substring(1,elm.length) //strip leading #
	elm = document.getElementById(elm)
      } // else assume it's a DOM Element
      var s = {}
      var attrs = elm.attributes
      for (var i = 0; i < attrs.length; i++) {
	s[attrs[i].nodeName] = attrs[i].nodeValue
      }
      return s
    } catch(e) {
      return null
    }
  },
  
  //handle an ajax state, which may define it's own handler
  handle : function(state, handler) {
    try {
      handler = eval(handler || (state.handle || state.handler) || Ajaxify.defaultHandler)
      handler(state)
    }
    catch(e) {
      Ajaxify.logMessage('Ajaxify.handle() error!' + e)
    }
  },
  
  /* Handle state, do something ajaxy.. (Depends on jQuery)
     This is the default thing to do:
     1. Execute jsbefore javascript (if present)
     2. Make a request to href?format=<format>
     3. If update is passed, load that element with the result of the request
     state (Object) representation of a link
     href :  request URL
     push : push into browser history?  Default is true. Pass push="no" to disable.
     format : format to inject into request url
     update : element(s) selector to update. Typically a single div id. Eg. #mycontent
     jsbefore : javascript to execute before making request (always invoked)
     onsuccess : request callback like function(data) {...}
     onfailure : request callback like function(data) {...}
     oncomplete : request callback like function(data) {...}
     jsafter : javascript to execute after making request (only invoked if request is made)
  */
  // Depends on jQuery
  defaultHandler : function(state) {
    //parse options
    var url = state.href || state.url
    var format = state.format || Ajaxify.defaultRequestFormat
    var divId = state.update || state.divid //update a single div, by ID
    var spinner = (state.spinner != "no")

    try { if (state.jsbefore && state.jsbefore!="") { eval(state.jsbefore) } } catch (e) {}

    // making a request ?
    if (url && url.indexOf("javascript:") == -1) {
      // inject format= into url
      if (format && url && url.indexOf("format=") == -1) {
	if (url.indexOf("?") == -1) url += "?format="+format
	else url += "&format="+format
      }
      // insert loading "spinner" inside the div, this can be hidden or moved about with css
      // This should go unnoticed if it is not styled..
      if (divId) { 
	var elms = $(divId)
	$(elms).prepend("<div class=\"ajax-spinner\"></div>")
      }
      var requestType = state['request-type'] || state['method'] 
      // make request, execute callbacks, load div if successful and update element is present
      $.ajax({
	url: url,
	type: (requestType || 'GET'),
	data: null, //could serialize form(s) here
	success: function(data) {
	  if (divId) {
	    var elms = $(divId)
	    if (elms.length == 0) Ajaxify.logMessage("Container update element '"+divId+"' was not found!")
	    //Replace the div content
	    $(elms).html(data)
	    //Ajaxify the loaded div
	    //JD: The links are somehow already ajaxified.  How ?? Why ??
	    // and uncommenting the following line causes major havok!
	    //$(elms).ajaxify(state)
	  }
	  try { if (state.onsuccess && state.onsuccess!="") { eval(state.onsuccess)(data) } } catch (e) {}
	},
	failure: function(data) {
	  try { if (state.onfailure && state.onfailure!="") { eval(state.onfailure)(data) } } catch (e) {}
	},
	complete: function(data) {
	  try { if (state.oncomplete && state.oncomplete!="") { eval(state.oncomplete)(data) } } catch (e) {}
	  try { if (state.jsafter && state.jsafter!="") { eval(state.jsafter) } } catch (e) {}
	}
      })
    } // if url
  }
}; //end Ajaxify


// Add ajaxify method to jQuery.fn
(function($){
  $.fn.ajaxify = Ajaxify.ajaxify
})(jQuery);

//Export Library (so you can compile this javascript)
window['jQuery'] = jQuery;
window['Ajaxify'] = Ajaxify;

