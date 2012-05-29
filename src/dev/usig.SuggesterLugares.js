// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SuggesterLugares
 * Implementa un suggester de lugares usando el inventario.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, usig.Inventario<br/>
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
usig.SuggesterLugares = (function($) { // Soporte jQuery noConflict
return usig.Suggester.extend({
	
	init: function(options){
		if(options!=undefined){
			var searchOpts = $.extend({}, usig.SuggesterLugares.defaults.searchOptions, options.searchOptions);
			options.searchOpts = searchOpts;
		}
		var opts = $.extend({}, usig.SuggesterLugares.defaults, options);
		
        this._super('Lugares', opts);
		// El inventario puede ser opcional para 
		// permitir overridearlos en los tests de unidad y reemplazarlos por mock objects.
		if (!this.opts.inventario) {
            this.opts.inventario = new usig.Inventario(opts);
			this.cleanList.push(this.opts.inventario);
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
		var maxSug = maxSuggestions!=undefined?maxSuggestions:this.opts.maxSuggestions;
		try {
			this.opts.inventario.buscar(text, callback, function (){}, { limit: maxSug });
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
		if (!(obj instanceof usig.inventario.Objeto)) {
			callback(new usig.Suggester.GeoCodingTypeError());
		} else {
    		this.opts.inventario.getObjeto(obj, function (objCompleto){
    			if (objCompleto.direccionAsociada) {
    				callback(objCompleto.direccionAsociada.getCoordenadas());
    			} else if (objCompleto.ubicacion) {
    				callback(objCompleto.ubicacion.getCentroide());
    			}
    		},function(){});
    	}
	},

	/**
	 * Permite abortar la ultima consulta realizada 
	 */
	abort: function() {
		this.opts.inventario.abort();
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
		this.opts.inventario.setOptions(options);
	}
});
//Fin jQuery noConflict support
})(jQuery);

usig.SuggesterLugares.defaults = {
	serverTimeout: 15000,
	maxRetries: 5,
	maxSuggestions: 10,
	searchOptions: {
		start: 0,
		limit: 20,
		tipoBusqueda: 'ranking',
		categoria: undefined,
		clase: undefined,
		bbox: false,
		extent: undefined,
		returnRawData: false
	}
};

usig.registerSuggester('Lugares', usig.SuggesterLugares);
