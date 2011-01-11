// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SuggesterDirecciones
 * Implementa un suggester de direcciones usando el Normalizador de Direcciones.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, Normalizador de Direcciones 1.0+<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Boolean} acceptSN Indica si debe permitir como altura S/N para las calles sin numeracion oficial. Por defecto es <code>True</code>. Ej: de los italianos s/n.
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo 
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.SuggesterDirecciones = usig.Suggester.extend({
	
	init: function(options){
		this._super('Direcciones', options);
		// El normalizador de direcciones y el geocoder pueden ser opciones para 
		// permitir overridearlos en los tests de unidad y reemplazarlos por mock objects.
		if (!this.opts.normalizadorDirecciones) {
			this.opts.normalizadorDirecciones = new usig.NormalizadorDirecciones({ aceptarCallesSinAlturas: this.opts.acceptSN, onReady: this.opts.onReady });
			this.cleanList.push(this.opts.normalizadorDirecciones);
		}	
		if (!this.opts.geoCoder) {
			this.opts.geoCoder = new usig.GeoCoder({ debug: this.opts.debug });
			this.cleanList.push(this.opts.geoCoder);
		}
	},
	
	/**
	 * Dado un string, realiza una busqueda de direcciones y llama al callback con las
	 * opciones encontradas.
	 * @param {String} text Texto de input
	 * @param {Function} callback Funcion que es llamada con la lista de sugerencias
	 * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
	 */
	getSuggestions: function(text, callback, maxSuggestions) {
		var maxSug = maxSuggestions!=undefined?maxSuggestions:this.opts.maxSuggestions;
		try {
		    callback(this.opts.normalizadorDirecciones.normalizar(text, maxSug)); 
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
		if (!(obj instanceof usig.Direccion)) {
			callback(new usig.Suggester.GeoCodingTypeError());
		} else {
			this.opts.geoCoder.geoCodificarDireccion(obj, (function(pt) {
				if (typeof(this.opts.afterServerResponse) == "function")
					this.opts.afterServerResponse();
				callback(pt);
			}).createDelegate(this));
			if (typeof(this.opts.afterServerRequest) == "function")
				this.opts.afterServerRequest();
		}
	},
	
	/**
	 * Indica si el componente esta listo para realizar sugerencias
	 * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
	 */
	ready: function() {
		return this.opts.normalizadorDirecciones.listo();
	}
	
});

usig.SuggesterDirecciones.defaults = {
	serverTimeout: 5000,
	maxRetries: 5,
	maxSuggestions: 10
}