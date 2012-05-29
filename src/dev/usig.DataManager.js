// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.debug) == "undefined") {
	usig.debug = function(object) {	
		if (window.console && window.console.log)
				window.console.log(object);
	};	
}

usig.DataManagerDefaults = {
	retry: true,
	retryTimeout: 1000,
	expirationTime: 600000,
	debug: false,
	ajaxParams: {
		type: 'GET',
		dataType: 'jsonp'
	}
};

usig.DataManager = (function($) { // Soporte jQuery noConflict
return new function() {
	var store = {};
	var registeredClasses = {};
	var opts = usig.DataManagerDefaults;
	
	this.setOpts = function(options) {
		opts = $.extend(true, {}, usig.DataManagerDefaults, options);
	};
	
	this.registerClass = function(className, params) {
		registeredClasses[className] = $.extend(true, {}, usig.DataManagerDefaults, params);
		store[className] = {};
		if (opts.debug) { usig.debug(store); usig.debug(registeredClasses);	}
	};
	
	function isFresh(className, id) {
		var curTime = new Date();
		if (typeof(store[className][id])!="undefined") {
			return (curTime - store[className][id].storeTime) < registeredClasses[className].expirationTime;
		} else {
			return false;
		}
	};
	
	this.getData = function(className, id, params) {
		if (typeof(registeredClasses[className]) != "undefined") {
			if (this.isCached(className, id)) {
				if (typeof(params.success) == "function")
					params.success(store[className][id].data);
				else 
					return store[className][id].data;
			} else {
				if (typeof(registeredClasses[className].getter) == "function") {
					if (opts.debug) { usig.debug('Calling getter with params: '+className+'/'+id); usig.debug(params); }
					if (typeof(params.success) == "function")
						params.success(registeredClasses[className].getter(className, id, params));
					else 
						return registeredClasses[className].getter(className, id, params);
				} else {
					if (opts.debug) { usig.debug('Trying to make Ajax request with params: '+className+'/'+id); usig.debug(params); }
					mkAjaxRequest.createDelegate(this, [className, id, params])();
				}
			}
		} else {
			if (opts.debug)	usig.debug('La clase '+className+' no está registrada.');
		}
	};
	
	this.storeData = function(className, id, data) {
		store[className][id] = { data: data, storeTime: new Date()};
	};
	
	this.removeData = function(className, id) {
		store[className][id] = undefined;
	};
	
	this.isCached = function(className, id) {
		return typeof(store[className]) != "undefined" && typeof(store[className][id]) != "undefined" && isFresh(className, id); 
	};
	
	this.isRegistered = function(className) {
		return (typeof(registeredClasses[className]) != "undefined");		
	};
	
	function onAjaxSuccess(data, className, id, receiver) {
		clearTimeout(store[className][id]);
		if (opts.debug) { usig.debug('Received data for: '+className+'/'+id); usig.debug(data);	}
		this.storeData(className, id, data);
		receiver(data);
	};
	
	function onAjaxTimeout(requester, className, id, params) {
		if (requester != null && requester.readyState != 0 && requester.readyState != 4) {
			if (opts.debug) usig.debug('Aborting request...');
			requester.abort();
	       	var ajaxReq = $.ajax(params);
			if (opts.debug) usig.debug('Retrying request...');
	    	store[className][id] = setTimeout(onAjaxTimeout.createDelegate(this, [ajaxReq, className, id, params]), registeredClasses[className].retryTimeout);
		}
	};
	
	function mkAjaxRequest(className, id, params) {
		if (typeof(params.success) != "function") {
			if (opts.debug)	usig.debug('params.success tiene que ser una función que acepte como parámetro el dato solicitado porque puede no estar inmediatamente disponible.');
			return;
		}
		if (typeof(params.error) != "undefined" && typeof(params.error) != "function") {
			if (opts.debug)	usig.debug('params.error tiene que ser una función.');
			return;
		}
       	var ajaxParams = $.extend(true, {}, usig.DataManagerDefaults.ajaxParams, registeredClasses[className].ajaxParams);
       	if (typeof(ajaxParams.url) == "undefined") {
       		if (opts.debug)	usig.debug('Falta definir ajaxParams.url para la clase: '+className);
       		return;
       	}
       	ajaxParams.success = onAjaxSuccess.createDelegate(this, [className, id, params.success], 1);
       	ajaxParams.error = params.error;
       	ajaxParams.data = params;
       	var ajaxReq = $.ajax(ajaxParams);
       	if (registeredClasses[className].retry)
       		store[className][id] = setTimeout(onAjaxTimeout.createDelegate(this, [ajaxReq, className, id, ajaxParams]), registeredClasses[className].retryTimeout);
	};
};

//Fin jQuery noConflict support
})(jQuery);
