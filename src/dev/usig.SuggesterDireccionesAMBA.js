// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SuggesterDireccionesAMBA
 * Implementa un suggester de direcciones del AMBA.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, usig.NormalizadorAMBA<br/>
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
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.SuggesterDireccionesAMBA = (function($) { // Soporte jQuery noConflict
return usig.Suggester.extend({

	init: function(options){
		var opts = $.extend({}, usig.SuggesterDireccionesAMBA.defaults, options);
		
        this._super('DireccionesAMBA', opts);
		// El normalizador puede ser opcional para 
		// permitir overridearlos en los tests de unidad y reemplazarlos por mock objects.
		if (!this.opts.normalizadorAMBA) {
			this.opts.normalizadorAMBA = new usig.NormalizadorAMBA(opts);
			this.cleanList.push(this.opts.normalizadorAMBA);
		}
		if (opts.onReady && typeof(opts.onReady) == "function") {
			opts.onReady();
		}
	},
	
	/**
	 * Dado un string, realiza una busqueda en el normalizador AMBA y llama al callback con las
	 * opciones encontradas.
	 * @param {String} text Texto de input
	 * @param {Function} callback Funcion que es llamada con la lista de sugerencias
	 * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
	 */
	getSuggestions: function(text, callback, maxSuggestions) {
		var maxSug = maxSuggestions!=undefined?maxSuggestions:this.opts.maxSuggestions;
		try {
			this.opts.normalizadorAMBA.buscar(text, callback, function (){}, maxSug);
		} catch (error) {
			callback(error);
		}
	},
	
	/**
	 * Dado un objeto de los que devuelve getSuggestions, retorna la geocodificacion correspondiente.
	 * @param {Object} obj Objeto del tipo devuelto por getSuggestions
	 * @param {Function} callback Funcion que es llamada con la geocodificacion correspondiente 
	 * (una instancia de usig.Geometria) 
	 */
	getGeoCoding: function(obj, callback) {
		if (obj instanceof usig.Direccion) {
			if (obj.getCoordenadas() instanceof usig.Punto) {
				callback(obj.getCoordenadas());
			} else {
				this.opts.normalizadorAMBA.geoCodificarDireccion(obj, callback)
			}
		} else {
			callback(new usig.Suggester.GeoCodingTypeError());
		}
	},

	/**
	 * Permite abortar la ultima consulta realizada 
	 */
	abort: function() {
		this.opts.normalizadorAMBA.abort();
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
		this.opts.normalizadorAMBA.setOptions(options);
	}
});
//Fin jQuery noConflict support
})(jQuery);

usig.SuggesterDireccionesAMBA.defaults = {
	debug: true,
	serverTimeout: 30000,
	maxRetries: 1,
	maxSuggestions: 10
};

usig.registerSuggester('DireccionesAMBA', usig.SuggesterDireccionesAMBA);
