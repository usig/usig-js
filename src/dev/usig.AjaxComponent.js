// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AjaxComponent
 * Esta es una clase abstracta de la que deben heredar aquellos componentes que realicen llamadas
 * asincronicas a un servidor para obtener informacion. Implementa tanto Ajax como JSONp con soporte
 * de timeout y retry automatico configurable.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, jquery.jsonp-1.1.0.1+, json, usig.core<br/>
 * @namespace usig
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @constructor 
 * @param {String} name Un nombre para el componente 
 * @param {String} serverUrl Url del servidor por defecto que se usara en caso de no especificarse al hacer
 * el request. 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.AjaxComponent = (function($) {
return jQuery.Class.create({
	
	init: function(name, serverUrl, options){
    	this.name = name;
    	var dataType = options.dataType || (window.location.host == usig.parseUri(serverUrl).authority?'json':'jsonp');
    	this.defaultParams = {
			type: 'GET',
			url: serverUrl,
			dataType: dataType    		
    	};
		this.opts = $.extend({}, usig.AjaxComponent.defaults, options);

		/*
		if (!this.opts.jQueryJsonp)	{
			if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') Using jQuery-jsonp plugin');
			jQuery.jsonp.setup({
				callbackParameter: 'callback',
				pageCache: true,
				dataFilter: function(json) {
		     	  return JSON.parse(JSON.stringify(json));
		    	}
			});
		} else {
			if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') Using jQuery.ajax for jsonp');			
		}
		*/
		if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') dataType: '+dataType);
	},
	
	/**
	 * Dado un string, realiza una busqueda de sugerencias y llama al callback con las
	 * opciones encontradas.
	 * @param {Object} data Objeto conteniendo parametros a enviar al servidor
	 * @param {Function} success Funcion que es llamada con el resultado en caso de exito
	 * @param {Function} error (optional) Funcion que es llamada en caso de error
	 * @param {String} url (optional) Url a utilizar en el request. En caso de no ser provista
	 * utiliza el default seteado en la inicializacion del componente.
	 */
	mkRequest: function(data, success, error, url) {
		var requestTimeout = null, numRetries = 0, promise = $.Deferred();
		
		function onAjaxSuccess(data, callback) {
			clearTimeout(requestTimeout);
			if (this.opts.debug) { usig.debug('usig.AjaxComponent('+this.name+') Ajax Request Success'); }
	       	if (typeof(this.opts.afterServerResponse) == "function") {
		       	if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') calling afterServerResponse');
	       		this.opts.afterServerResponse();
	       	}
			callback(data);
	       	promise.resolve(data);
		}; 
		
		function onAjaxError(data, callback) {
			if (this.opts.debug) { usig.debug('usig.AjaxComponent('+this.name+') Ajax Request Error'); }			
	       	if (numRetries >= this.opts.maxRetries) {
				if (this.opts.debug) { usig.debug('usig.AjaxComponent('+this.name+') Ajax Request Max Errors Reached'); }			
	       		clearTimeout(requestTimeout);
	       		if (typeof(callback)=="function") {
	       			callback(data);
	       		}
	       		promise.reject(data);
	       	} else {
				if (this.opts.debug) { usig.debug('usig.AjaxComponent('+this.name+') Ajax Request Error. Retrying... ('+numRetries+')'); }			
	       	}
		}; 
		
		function onAjaxTimeout(requester, params) {
			if (requester != null && requester.readyState != 0 && requester.readyState != 4) {
				if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') Aborting request...');
				requester.abort();
		       	if (typeof(this.opts.afterAbort) == "function") {
			       	if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') calling afterAbort');
		       		this.opts.afterAbort();
		       	}
		       	if (this.opts.maxRetries > numRetries) {
		       		numRetries++;
//			       	var ajaxReq = (params.dataType == 'jsonp')?$.jsonp(params):$.ajax(params);
			       	var ajaxReq = $.ajax(params);
			       	if (typeof(this.opts.afterRetry) == "function") {
				       	if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') calling afterRetry');
			       		this.opts.afterRetry();
			       	}
					if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') Retrying request... ('+numRetries+')');
		       		requestTimeout = setTimeout(onAjaxTimeout.createDelegate(this, [ajaxReq, ajaxParams]), this.opts.serverTimeout);
		       	} else {
					if (this.opts.debug) usig.debug('ERROR: Se alcanzo el maximo numero de reintentos al servidor sin exito.');
					if (typeof(params.error) == "function")
						params.error('Se produjo un error al intentar acceder al servidor: '+params.url);
		       	}
			}
		};
		
		if (typeof(success) != "function") {
			if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') success tiene que ser una función que acepte como parámetro el dato solicitado porque puede no estar inmediatamente disponible.');
			return;
		}
		
		if (typeof(error) != "undefined" && typeof(error) != "function") {
			if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') error tiene que ser una función.');
			return;
		}
		
       	var ajaxParams = $.extend(true, {}, this.defaultParams, { 
       		success: onAjaxSuccess.createDelegate(this, [success], 1), 
       		error: onAjaxError.createDelegate(this, [error], 1), 
       		data: data 
       	});
       	if (url) ajaxParams.url = url;
       	
//       	var ajaxReq = (ajaxParams.dataType == 'jsonp' && !this.opts.jQueryJsonp)?$.jsonp(ajaxParams):$.ajax(ajaxParams);
       	var ajaxReq = $.ajax(ajaxParams);
       	
       	if (this.opts.debug) usig.debug(ajaxParams.dataType+' request...');
       	
       	if (typeof(this.opts.afterServerRequest) == "function") {
	       	if (this.opts.debug) usig.debug('usig.AjaxComponent('+this.name+') calling afterServerRequest');
       		this.opts.afterServerRequest();
       	}
       		
       	if (this.opts.serverTimeout > 0)
       		requestTimeout = setTimeout(onAjaxTimeout.createDelegate(this, [ajaxReq, ajaxParams]), this.opts.serverTimeout);
       	
       	// return ajaxReq;
       	return promise;
	},
		
	/**
	 * Actualiza la configuracion del componente a partir de un objeto con overrides para las
	 * opciones disponibles
	 * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
	 */
	setOptions: function(options) {
		this.opts = $.extend({}, this.opts, options);		
	},
	
	/**
	 * Devuelve las opciones actualmente vigentes para el componente.
	 * @return {Object} Objeto conteniendo las opciones actualmente vigentes para el componente.
	 */
	getOptions: function() {
		return this.opts;
	}
	
});
//Fin jQuery noConflict support
})(jQuery);

usig.AjaxComponent.defaults = {
	debug: false,
	serverTimeout: 30000,
	maxRetries: 1
}