// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SuggesterLocation
 * Implementa un suggester de ubicacion actual usando HTML5 GeoLocation.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.util, usig.Suggester<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} timeout Tiempo maximo de espera (en ms) antes de abortar una geolocalizacion
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta una geolocalizacion.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta una geolocalizacion.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo 
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.SuggesterLocation = (function($) { // Soporte jQuery noConflict
return usig.Suggester.extend({
	
	init: function(options){
		var opts = $.extend({}, usig.SuggesterLocation.defaults, options);
        this._super('Location', opts);
		if (opts.onReady && typeof(opts.onReady) == "function") {
			opts.onReady();
		}
	},
	
	/**
	 * Dado un string, realiza una busqueda en el indice catastral y llama al callback con las
	 * opciones encontradas.
	 * @param {String} text Texto de input
	 * @param {Function} callback Funcion que es llamada con la lista de sugerencias
	 * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
	 */
	getSuggestions: function(text, callback, maxSuggestions) {
		var maxSug = maxSuggestions!=undefined?maxSuggestions:this.opts.maxSuggestions,
			sug = this.opts.text;
		if (this.opts.text.indexOf(text) >= 0) {
			callback([new usig.Location(0, 0)]);
		}
	},
	
	/**
	 * Dado un objeto de los que devuelve getSuggestions, retorna la geocodificacion correspondiente.
	 * @param {Object} obj Objeto del tipo devuelto por getSuggestions
	 * @param {Function} callback Funcion que es llamada con la geocodificacion correspondiente 
	 * (una instancia de usig.Geometria) 
	 */
	getGeoCoding: function(obj, callback) {
		if (typeof(callback) == "function" && usig.geoLocate) {
			usig.geoLocate(function(loc) {
				obj.setLatLng(loc.lat, loc.lng);
				callback(loc.getCoordenadas());
			}, function(e) {
				console.log(e);
			});

		}
	},

	/**
	 * Permite abortar la ultima consulta realizada 
	 */
	abort: function() {
		
	},
	
	/**
	 * Indica si el componente esta listo para realizar sugerencias
	 * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
	 */
	ready: function() {
		return true;
	},
	
	/**
	 * Actualiza la configuracion del componente a partir de un objeto con overrides para las
	 * opciones disponibles
	 * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
	 */
	setOptions: function(options) {
		this._super(options);
	}
});
//Fin jQuery noConflict support
})(jQuery);

usig.SuggesterLocation.defaults = {
	timeout: 10000,
	maxRetries: 1,
	maxSuggestions: 1,
	text: 'Ubicación actual'
};

usig.registerSuggester('Location', usig.SuggesterLocation);
