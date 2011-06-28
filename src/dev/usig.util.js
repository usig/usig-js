// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
/**
 * @class usig
 * This class defines common public methods for USIG applications
 */

/**
 Loads the specified script dynamically on the current page
 @param {String} filename Url of the js script to load
 */
usig.loadJs = function(filename) {
	var fileref=document.createElement('script')
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", filename)
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
};

/**
 Loads the specified css script dynamically on the current page
 @param {String} filename Url of the css script to load
 */
usig.loadCss = function(filename) {
	var fileref=document.createElement("link")
	fileref.setAttribute("rel", "stylesheet")
	fileref.setAttribute("type", "text/css")
	fileref.setAttribute("href", filename)	
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
};

/**
 Remove the specified js script from the current page
 @param {String} filename Url of the script to remove
 */
usig.removeJs = function(filename) {
	var allsuspects=document.getElementsByTagName("script");
	for (var i=allsuspects.length; i>=0; i--) { //search backwards within nodelist for matching elements to remove
		  if (allsuspects[i] && allsuspects[i].getAttribute("src")!=null && allsuspects[i].getAttribute("src").indexOf(filename)!=-1)
			   allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
	}
};

/**
 Remove the specified css script from the current page
 @param {String} filename Url of the script to remove
 */
usig.removeCss = function(filename) {
	var allsuspects=document.getElementsByTagName("link");
	for (var i=allsuspects.length; i>=0; i--) { //search backwards within nodelist for matching elements to remove
		  if (allsuspects[i] && allsuspects[i].getAttribute("href")!=null && allsuspects[i].getAttribute("href").indexOf(filename)!=-1)
			   allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
	}
};

/**
 Starts an animation by applying <b>procedure</b> to each element of <b>inputArray</b> using <b>stepDelay</b>
 as a delay time between steps. If the optional parameter <b>callback</b> is provided it is called at the 
 end of the animation process.
 @param {Array} inputArray An array of arbitrary objects
 @param {Function} procedure A procedure which can operate on each member of inputArray
 @param {Number} stepDelay The delay for each step of the animation
 @param {Function} callback (optional) A callback function to be called at the end of the process
 @return {Object} The animator object
 */
usig.Animator = function(inputArray, procedure, stepDelay, callback) {
	var index = 0;
	
	function animate() {
		if (inputArray.length > index) {
			procedure(inputArray[index]);
			index++;
			setTimeout(animate, stepDelay);
		} else if (typeof(callback) == "function") {
			callback();
		}
	}
	
	this.stop = function () {
		index = inputArray.length+1;
	}
	
	animate();
};

/**
parseUri JS v0.1.1, by Steven Levithan <br/> 
Splits any well-formed URI into the following parts (all are optional): <br/>
<ul>
<li>source (since the exec method returns the entire match as key 0, we might as well use it)</li>
<li>protocol (i.e., scheme)</li>
<li>authority (includes both the domain and port)<br/>
  - domain (i.e., host; can be an IP address)<br/>
  - port</li>
<li>path (includes both the directory path and filename)<br/>
  - directoryPath (supports directories with periods, and without a trailing backslash)<br/>
  - fileName</li>
<li>query (does not include the leading question mark)</li>
<li>anchor (i.e., fragment)</li>
</ul>
@param {String} sourceUri URI to parse 
*/
usig.parseUri = function(sourceUri){
	var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"],
		uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri),
		uri = {};
	
	for(var i = 0; i < 10; i++){
		uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
	}
	
	/* Always end directoryPath with a trailing backslash if a path was present in the source URI
	Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key */
	if(uri.directoryPath.length > 0){
		uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
	}
	
	return uri;
};

usig.registeredSuggesters = {};

/**
 Registers the specified suggester for general use
 @param {String} name Name which identifies the suggester
 @param {Function} constructor Function/Class constructor
 */	
usig.registerSuggester = function(name, constructor) {
	usig.registeredSuggesters[name] = constructor;
};

/**
 Creates an instance of the specified suggester if it's registered or throws an exception and returns null.
 @param {String} name Name which identifies the suggester
 @param {Object} options (optional) An object containing overrides for the default options 
 @return {Object} Instance of the specified suggester
 */	
usig.createSuggester = function(name, options) {
	if (typeof(usig.registeredSuggesters[name]) != "function") {
		throw "Suggester "+name+" is not registered.";
		return null;
	}
	return new usig.registeredSuggesters[name](options);
};
