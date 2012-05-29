// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Suggester
 * Esta es una clase abstracta de la que deben heredar aquellos componentes que quieran funcionar como
 * suggesters para el AutoCompleter. Cuando un metodo no sea implementado por quien hereda se disparara
 * una excepcion usig.Suggester.MethodNotImplemented al invocarlo.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo 
 * @constructor 
 * @param {String} name Un nombre que indique el tipo de sugerencias que hace este suggester 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.Suggester = (function($) { // Soporte jQuery noConflict
return jQuery.Class.create({
	
	init: function(name, options){
    	this.name = name;
    	this.cleanList = [];
		this.opts = $.extend({}, usig.Suggester.defaults, options);		
	},
	
	/**
	 * Dado un string, realiza una busqueda de sugerencias y llama al callback con las
	 * opciones encontradas.
	 * @param {String} text Texto de input
	 * @param {Function} callback Funcion que es llamada con la lista de sugerencias
	 * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
	 */
	getSuggestions: function(text, callback, maxSuggestions) {		
		throw new usig.Suggester.MethodNotImplemented();
	},
	
	/**
	 * Dado un objeto de los que devuelve getSuggestions, retorna la geocodificacion correspondiente.
	 * @param {Object} obj Objeto del tipo devuelto por getSuggestions
	 * @param {Function} callback Funcion que es llamada con la geocodificacion correspondiente 
	 * (una instancia de usig.Geometria) 
	 */
	getGeoCoding: function(obj, callback) {		
		throw new usig.Suggester.MethodNotImplemented();
	},

	/**
	 * Permite abortar la ultima consulta realizada 
	 */
	abort: function() {
		//throw new usig.Suggester.MethodNotImplemented();
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
	},
	
	/**
	 * Indica si el componente esta listo para realizar sugerencias
	 * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
	 */
	ready: function() {
		throw new usig.Suggester.MethodNotImplemented();
	},
	
	/**
	 * Destruye los componentes creados. 
	 */
	destroy: function() {
		for (var i=0; i<this.cleanList.length; i++)
			delete this.cleanList[i];		
	}
	
});
//Fin jQuery noConflict support
})(jQuery);

usig.Suggester.defaults = {
	debug: false,
	serverTimeout: 15000,
	maxRetries: 5,
	maxSuggestions: 10
};

usig.Suggester.MethodNotImplemented = function() {
	this.msg = 'Suggester: Method Not Implemented.';
	this.toString = function() {
		return this.msg;
	}
};

usig.Suggester.GeoCodingTypeError = function() {
	this.msg = 'Suggester: Wrong object type for geocoding.';
	this.toString = function() {
		return this.msg;
	}
};
