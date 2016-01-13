// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class SuggesterDirecciones
 * Implementa un suggester de direcciones usando el Normalizador de Direcciones.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, Normalizador de Direcciones 1.4+, GeoCoder<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Boolean} acceptSN Indica si debe permitir como altura S/N para las calles sin numeracion oficial. Por defecto es <code>True</code>. Ej: de los italianos s/n.
 * @cfg {Boolean} callesEnMinusculas Indica si se desea que los nombres de las calles normalizados sean en minúsculas (Por defecto: false)
 * @cfg {Boolean} ignorarTextoSobrante Indica si se desea ignorar el texto sobrante cuando se encuentra una direccion. Por ejemplo: Corrientes 1234 3ro D seria aceptado como Corrientes 1234 (Por defecto: true)
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo 
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.SuggesterDirecciones = (function($) { // Soporte jQuery noConflict
return usig.Suggester.extend({
	
	init: function(options){
		var opts = $.extend({}, usig.SuggesterDirecciones.defaults, options);
		this._super('Direcciones', opts);
		// El normalizador de direcciones y el geocoder pueden ser opciones para 
		// permitir overridearlos en los tests de unidad y reemplazarlos por mock objects.
		if (!this.opts.normalizadorDirecciones) {
			this.opts.normalizadorDirecciones = usig.NormalizadorDirecciones.init({ aceptarCallesSinAlturas: this.opts.acceptSN, callesEnMinusculas: this.opts.callesEnMinusculas, onReady: this.opts.onReady });
			this.cleanList.push(this.opts.normalizadorDirecciones);
		}	
		if (!this.opts.geoCoder) {
			this.opts.geoCoder = new usig.GeoCoder(this.opts);
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
		if (this.opts.debug) usig.debug('usig.SuggesterDirecciones.getSuggestions(\'' + text + '\')');
		var maxSug = maxSuggestions!=undefined?maxSuggestions:this.opts.maxSuggestions;
		try {
			var dirs = this.opts.normalizadorDirecciones.normalizar(text, maxSug);
			dirs.map(function(d) { d.descripcion='Ciudad Autónoma de Buenos Aires'});
			callback(dirs);
		} catch (error) {
			if (this.opts.ignorarTextoSobrante) {
				try {
					var opciones = this.opts.normalizadorDirecciones.buscarDireccion(text);
					if (opciones!==false) {
						var dirs = [opciones.match];
						dirs.map(function(d) { d.descripcion='Ciudad Autónoma de Buenos Aires'});
						callback(dirs);
					} else {
						callback(error);
					}
				} catch(error){
					callback(error);
				}
			} else {
				callback(error);
			}
		}
		/*
		try {
		    callback(this.opts.normalizadorDirecciones.normalizar(text, maxSug)); 
		} catch (error) {
			callback(error);
		} 
		*/
	},

	/**
	 * Dado un objeto de los que devuelve getSuggestions, retorna la geocodificacion correspondiente.
	 * @param {Object} obj Objeto del tipo devuelto por getSuggestions
	 * @param {Function} callback Funcion que es llamada con la geocodificacion correspondiente 
	 * (una instancia de usig.Geometria) 
	 */
	getGeoCoding: function(obj, callback) {
		if (this.opts.debug) usig.debug('usig.SuggesterDirecciones.getGeoCoding(obj, callback)');
		if (!(obj instanceof usig.Direccion)) {
			callback(new usig.Suggester.GeoCodingTypeError());
		} else {
			this.opts.geoCoder.geoCodificarDireccion(obj, callback);
		}
	},
	
	/**
	 * Indica si el componente esta listo para realizar sugerencias
	 * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
	 */
	ready: function() {
		return this.opts.normalizadorDirecciones.listo();
	},
	
	/**
	 * Actualiza la configuracion del componente a partir de un objeto con overrides para las
	 * opciones disponibles
	 * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
	 */
	setOptions: function(options) {
		opts = $.extend({}, this.opts, options);
		this._super(opts);
		this.opts.geoCoder.setOptions(opts);
	}
});
//Fin jQuery noConflict support
})(jQuery);

usig.SuggesterDirecciones.defaults = {
	debug: false,
	serverTimeout: 5000,
	maxRetries: 5,
	maxSuggestions: 10,
	acceptSN: true,
	callesEnMinusculas: true,
	ignorarTextoSobrante: false
};

usig.registerSuggester('Direcciones', usig.SuggesterDirecciones);
