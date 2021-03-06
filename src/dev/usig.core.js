/**
 * @class Object 
 * Este archivo contiene extensiones al lenguaje Javascript estandar
 * rippeadas de ExtJS 2.2.1 y adaptadas a jQuery (usa jQuery.extend en lugar de Ext.apply)
 * 
 * Todas las extensiones estan tal cual salvo el metodo remove agregado a los Arrays que fue
 * renombrado por removeObject para evitar conflictos con el metodo remove de jQuery
 */
 
/**
 * Copies all the properties of config to obj if they don't already exist.
 * @param {Object} obj The receiver of the properties
 * @param {Object} config The source of the properties
 * @return {Object} returns obj
 */
jQuery.extendIf = function(o, c){
    if(o && c){
        for(var p in c){
            if(typeof o[p] == "undefined"){ o[p] = c[p]; }
        }
    }
    return o;
};

if (typeof(Ext) == "undefined") {
/**
 * @class Function 
*/
jQuery.extend(Function.prototype, {
     /**
     * Creates a callback that passes arguments[0], arguments[1], arguments[2], ...
     * Call directly on any function. Example: <code>myFunction.createCallback(arg1, arg2)</code>
     * Will create a function that is bound to those 2 args. <b>If a specific scope is required in the
     * callback, use {@link #createDelegate} instead.</b> The function returned by createCallback always
     * executes in the window scope.
     * <p>This method is required when you want to pass arguments to a callback function.  If no arguments
     * are needed, you can simply pass a reference to the function as a callback (e.g., callback: myFn).
     * However, if you tried to pass a function with arguments (e.g., callback: myFn(arg1, arg2)) the function
     * would simply execute immediately when the code is parsed. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

// clicking the button alerts "Hi, Fred"
new Ext.Button({
    text: 'Say Hi',
    renderTo: Ext.getBody(),
    handler: sayHi.createCallback('Fred')
});
</code></pre>
     * @return {Function} The new function
    */
    createCallback : function(/*args...*/){
        // make args available, in function below
        var args = arguments;
        var method = this;
        return function() {
            return method.apply(window, args);
        };
    },
    
    /**
     * Creates a delegate (callback) that sets the scope to obj.
     * Call directly on any function. Example: <code>this.myFunction.createDelegate(this, [arg1, arg2])</code>
     * Will create a function that is automatically scoped to obj so that the <tt>this</tt> variable inside the
     * callback points to obj. Example usage:
     * <pre><code>
var sayHi = function(name){
    // Note this use of "this.text" here.  This function expects to
    // execute within a scope that contains a text property.  In this
    // example, the "this" variable is pointing to the btn object that
    // was passed in createDelegate below.
    alert('Hi, ' + name + '. You clicked the "' + this.text + '" button.');
}

var btn = new Ext.Button({
    text: 'Say Hi',
    renderTo: Ext.getBody()
});

// This callback will execute in the scope of the
// button instance. Clicking the button alerts
// "Hi, Fred. You clicked the "Say Hi" button."
btn.on('click', sayHi.createDelegate(btn, ['Fred']));
</code></pre>
     * @param {Object} obj (optional) The object for which the scope is set
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     *                                             if a number the args are inserted at the specified position
     * @return {Function} The new function
     */
	createDelegate : function(obj, args, appendArgs){
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if(appendArgs === true){
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }else if(typeof appendArgs == "number"){
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        };
    },
    /**
     * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

// executes immediately:
sayHi('Fred');

// executes after 2 seconds:
sayHi.defer(2000, this, ['Fred']);

// this syntax is sometimes useful for deferring
// execution of an anonymous function:
(function(){
    alert('Anonymous');
}).defer(100);
</code></pre>
     * @param {Number} millis The number of milliseconds for the setTimeout call (if 0 the function is executed immediately)
     * @param {Object} obj (optional) The object for which the scope is set
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     *                                             if a number the args are inserted at the specified position
     * @return {Number} The timeout id that can be used with clearTimeout
     */
    defer : function(millis, obj, args, appendArgs){
        var fn = this.createDelegate(obj, args, appendArgs);
        if(millis){
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    },

    /**
     * Create a combined function call sequence of the original function + the passed function.
     * The resulting function returns the results of the original function.
     * The passed fcn is called with the parameters of the original function. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

sayHi('Fred'); // alerts "Hi, Fred"

var sayGoodbye = sayHi.createSequence(function(name){
    alert('Bye, ' + name);
});

sayGoodbye('Fred'); // both alerts show
</code></pre>
     * @param {Function} fcn The function to sequence
     * @param {Object} scope (optional) The scope of the passed fcn (Defaults to scope of original function or window)
     * @return {Function} The new function
     */
    createSequence : function(fcn, scope){
        if(typeof fcn != "function"){
            return this;
        }
        var method = this;
        return function() {
            var retval = method.apply(this || window, arguments);
            fcn.apply(scope || this || window, arguments);
            return retval;
        };
    },

    /**
     * Creates an interceptor function. The passed fcn is called before the original one. If it returns false,
     * the original one is not called. The resulting function returns the results of the original function.
     * The passed fcn is called with the parameters of the original function. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

sayHi('Fred'); // alerts "Hi, Fred"

// create a new function that validates input without
// directly modifying the original function:
var sayHiToFriend = sayHi.createInterceptor(function(name){
    return name == 'Brian';
});

sayHiToFriend('Fred');  // no alert
sayHiToFriend('Brian'); // alerts "Hi, Brian"
</code></pre>
     * @param {Function} fcn The function to call before the original
     * @param {Object} scope (optional) The scope of the passed fcn (Defaults to scope of original function or window)
     * @return {Function} The new function
     */
    createInterceptor : function(fcn, scope){
        if(typeof fcn != "function"){
            return this;
        }
        var method = this;
        return function() {
            fcn.target = this;
            fcn.method = method;
            if(fcn.apply(scope || this || window, arguments) === false){
                return;
            }
            return method.apply(this || window, arguments);
        };
    }
    
    
    
});

/**
 * @class String
 * These functions are available as static methods on the JavaScript String object.
 */
jQuery.extendIf(String, {

    /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    /**
     * Pads the left side of a string with a specified character.  This is especially useful
     * for normalizing number and date strings.  Example usage:
     * <pre><code>
var s = String.leftPad('123', 5, '0');
// s now contains the string: '00123'
</code></pre>
     * @param {String} string The original string
     * @param {Number} size The total length of the output string
     * @param {String} char (optional) The character with which to pad the original string (defaults to empty string " ")
     * @return {String} The padded string
     * @static
     */
    leftPad : function (val, size, ch) {
        var result = new String(val);
        if(!ch) {
            ch = " ";
        }
        while (result.length < size) {
            result = ch + result;
        }
        return result.toString();
    },

    /**
     * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
     * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
     * <pre><code>
var cls = 'my-class', text = 'Some text';
var s = String.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
// s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
</code></pre>
     * @param {String} string The tokenized string to be formatted
     * @param {String} value1 The value to replace token {0}
     * @param {String} value2 Etc...
     * @return {String} The formatted string
     * @static
     */
    format : function(format){
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    }
});
}

/**
 * Checks whether or not the current string can be converted to an Integer.
 * @return {Boolean} True if the string can be converted to an integer
 */
String.prototype.isInteger = function() {
	return !isNaN(parseInt(this));
};

/**
 * Checks whether or not the current string can be converted to a Float.
 * @return {Boolean} True if the string can be converted to a Float
 */
String.prototype.isFloat = function() {
   	return !isNaN(parseFloat(this));
};

/**
 * Utility function that allows you to easily switch a string between two alternating values.  The passed value
 * is compared to the current string, and if they are equal, the other value that was passed in is returned.  If
 * they are already different, the first value passed in is returned.  Note that this method returns the new value
 * but does not change the current string.
 * <pre><code>
// alternate sort directions
sort = sort.toggle('ASC', 'DESC');

// instead of conditional logic:
sort = (sort == 'ASC' ? 'DESC' : 'ASC');
</code></pre>
 * @param {String} value The value to compare to the current string
 * @param {String} other The new value to use if the string already equals the first value passed in
 * @return {String} The new value
 */
String.prototype.toggle = function(value, other){
    return this == value ? other : value;
};

/**
 * Trims whitespace from either end of a string, leaving spaces within the string intact.  Example:
 * <pre><code>
var s = '  foo bar  ';
alert('-' + s + '-');         //alerts "- foo bar -"
alert('-' + s.trim() + '-');  //alerts "-foo bar-"
</code></pre>
 * @return {String} The trimmed string
 */
String.prototype.trim = function(){
    var re = /^\s+|\s+$/g;
    return function(){ return this.replace(re, ""); };
}();

/**
 * Replaces each element from the 'from' array with the corresponding one in the 'to' array.
 * @return {String} The translated string
 */
String.prototype.translate = function(from, to)
{
    if (!(from.length && to.length) || from.length != to.length)
        return this;
    var str = this;
    for (var i=0;i<from.length;i++) {
    	if (typeof(from) == "string") {
            str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));    		
    	} else {
            str = str.replace(new RegExp(from[i], "g"), to[i]);
    	}
    }
    return str;
}   

/**
 * Tests the string to verify that each character be a digit (0-9).
 * @return {Boolean} True if all characters are digits
 */
String.prototype.isDigit = function(){ return /^\d+$/.test(this); }

/**
 * Utility function that allows you to easily remove certain words from a string.
 * @param {Array} words The words you wish to remove
 * @return {String} The new string
 */
String.prototype.removeWords = function(words)
{
    var myWords = this.split(' ');
    var res = new Array();
    for (var i=0; i<myWords.length; i++) {
        res.push(myWords[i]);
        for(var j=0; j<words.length; j++) {
            if (res[i] == words[j]) {
               res.pop();
               break;
            }
        }
    }
    return res.join(' ');
}   

/**
 * @class Number
 */
jQuery.extendIf(Number.prototype, {
    /**
     * Checks whether or not the current number is within a desired range.  If the number is already within the
     * range it is returned, otherwise the min or max value is returned depending on which side of the range is
     * exceeded.  Note that this method returns the constrained value but does not change the current number.
     * @param {Number} min The minimum number in the range
     * @param {Number} max The maximum number in the range
     * @return {Number} The constrained value if outside the range, otherwise the current value
     */
    constrain : function(min, max){
        return Math.min(Math.max(this, min), max);
    },
    
    /**
     * Checks whether or not the current number is an Integer.
     * @return {Boolean} True if the number is an integer
     */
    isInteger : function() {
    	return !isNaN(parseInt(this));
    },
    
    /**
     * Checks whether or not the current number is a Float.
     * @return {Boolean} True if the number is a float
     */
    isFloat : function() {
    	return !isNaN(parseFloat(this));
    }
});
/**
 * @class Array
 */
jQuery.extendIf(Array.prototype, {
    /**
     * Checks whether or not the specified object exists in the array.
     * @param {Object} o The object to check for
     * @return {Number} The index of o in the array (or -1 if it is not found)
     */
    indexOf : function(o){
       for (var i = 0, len = this.length; i < len; i++){
 	      if(this[i] == o) return i;
       }
 	   return -1;
    },

    /**
     * Removes the specified object from the array.  If the object is not found nothing happens.
     * @param {Object} o The object to remove
     * @return {Array} this array
     */
    removeObject : function(o){
       var index = this.indexOf(o);
       if(index != -1){
           this.splice(index, 1);
       }
       return this;
    },
    
    /**
     * Performs a binary search in an ordered array using a comparator defined exactly like the one
     * required by sort.
     * @param {Object} find The object to find
     * @param {Function} comparator The comparison function to use
     * @return {Integer} the index of the found element or -1 if none is found
     */
    binarySearch : function binarySearch(find, comparator) {
        var low = 0, high = this.length - 1, i, comparison;
        while (low <= high) {
            i = parseInt((low + high) / 2, 10);
            comparison = comparator(this[i], find);
            if (comparison < 0) { low = i + 1; continue; };
            if (comparison > 0) { high = i - 1; continue; };
            return i;
        }
        return -1;
    },
    
    /**
     * Implements an injection function like the on present in functional languages or Smalltalk.
     * @param {Object} acc The accumulator
     * @param {Function} it The function to use during iteration
     * @return {Object} the resulting accumulator
     */
    inject : function (acc, it) { 
            for (var i=0; i< this.length; i++)
                acc = it(acc, this[i], i);
            return acc;
        },
        
    map: function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    },

    /**
     * Syntax
     * Array Array.intersect([ Array a0 ... an ]) 
     * Computes the intersection between the calling array and any number of arrays passed as arguments. Duplicate values are removed from the result
     *
     * Parameters
     * Array a0 ... an (Optional)
     * The arrays to intersect with.
     *
     * Return value
     * A new array holding the intersection of elements
     * 
     * Examples
     * To find the intersection of the arrays (0,2,4,1,8,2), (1,3,5,2,9) and (100,2,9,1)
    <pre><code>
    // Define array 1
    var a1 = [0,2,4,1,8];
    // Define array 2
    var a2 = [1,3,5,2,9];
    // Define array 3
    var a3 = [100,2,9,1];
    // Output is Array(2,1)
    a1.intersect(a2,a3);
    </pre></code>
     */
    intersect: function() {
    	    if (!arguments.length)
    	      return [];
    	    var a1 = this;
    	    var a = a2 = null;
    	    var n = 0;
    	    while(n < arguments.length) {
    	      a = [];
    	      a2 = arguments[n];
    	      var l = a1.length;
    	      var l2 = a2.length;
    	      for(var i=0; i<l; i++) {
    	        for(var j=0; j<l2; j++) {
    	          if (a1[i] === a2[j])
    	            a.push(a1[i]);
    	        }
    	      }
    	      a1 = a;
    	      n++;
    	    }
    	    return a.unique();
    },
    
   /**
    * Method Array.unique
	* Remove any duplicates from an array
	* 
	* Syntax
    * Array Array.unique() 
    *
    * This function will return a new array with duplicates of the original array removed
    * Return value
    * A new array with no duplicates
    * Examples
<pre><code>
To remove the duplicates in the array (0,2,4,2,6,4,8,6,10);
// Define array
var a = new Array(0,2,4,2,6,4,8,6,10);
// Output is (0,2,4,8,6,10)
a.unique();
<pre><code>
    */
    unique: function() {
    	    var a = [];
    	    var l = this.length;
    	    for(var i=0; i<l; i++) {
    	      for(var j=i+1; j<l; j++) {
    	        // If this[i] is found later in the array
    	        if (this[i] === this[j])
    	          j = ++i;
    	      }
    	      a.push(this[i]);
    	    }
    	    return a;
   	}
});
/**
 * @class Date
 */

/**
 Returns the number of milliseconds between this date and date
 @param {Date} date (optional) Defaults to now
 @return {Number} The diff in milliseconds
 @member Date getElapsed
 */
Date.prototype.getElapsed = function(date) {
	return Math.abs((date || new Date()).getTime()-this.getTime());
};

// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

/**
 Shows the received object on the browser's debugging console
 @param {Object} object
 */
usig.debug = function(object) {	
	if (window.console && window.console.log)
			window.console.log(object);
};

