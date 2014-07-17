// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class GeoCoder
 * Esta clase implementa una interfaz Javascript con el servicio de GeoCoding de USIG<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, json, jquery.jsonp-1.1.0.1+, usig.core, usig.Punto, 
 * usig.Calle, usig.Direccion, usig.AjaxComponent<br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/tests/geoCoder.html">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/tests/geoCoder.html</a>
 * @namespace usig
 * @cfg {String} server Url del servicio de GeoCoding de USIG. Por defecto: 'http://usig.buenosaires.gov.ar/servicios/GeoCoder'.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {String} metodo Nombre del metodo de geocodificacion a utilizar si se omite el parametro en los metodos 
 * correspondientes. Si no se setea utiliza el metodo por defecto seteado en el servidor. 
 * <br/>Metodos de geocodificacion disponibles: 'interpolacion', 'puertas' y 'centroide'
 * <br/>Para mas informacion consultar: <a href="http://usig.buenosaires.gov.ar/servicios/GeoCoder">http://usig.buenosaires.gov.ar/servicios/GeoCoder</a>
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.GeoCoder = (function($) { // Soporte jQuery noConflict
return usig.AjaxComponent.extend({
	
	metodos: ['interpolacion', 'puertas', 'centroide'],
	
	init: function(options) {
		var opts = $.extend({}, usig.GeoCoder.defaults, options);		
		this._super('GeoCoder', usig.GeoCoder.defaults.server, opts);
	},
	
	validarMetodo: function(metodo) {
		if (metodo != undefined) {
			if (this.metodos.indexOf(metodo) >= 0) {
				return metodo;
			}
		} else if (this.opts.metodo != undefined) {
			return this.opts.metodo;
		}		
		return undefined;		
	},
	
	onSuccess: function(res, success) {
		if (typeof(res) != "string") {
			success(new usig.Punto(res.x, res.y));
		} else {
			success(res);
		}
	},
	
	/**
	 * Realiza una geocodificacion a partir de una instancia de usig.Direccion (NormalizadorDireccionesJS)
     * @param {usig.Direccion} dir Direccion a geocodificar.  
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
     * @param {String} metodo (optional) Metodo de geocodificacion a utilizar (solo aplicable a direcciones calle-altura).   
    */	
	geoCodificarDireccion: function(dir, success, error, metodo) {
		if (!(dir instanceof usig.Direccion)) {
			throw('dir debe ser una instancia de usig.Direccion');
			return;
		}
		if (dir.getTipo() == usig.Direccion.CALLE_ALTURA) {
			this.geoCodificarCodigoDeCalleAltura(dir.getCalle().codigo, dir.getAltura(), success, error, metodo);
		} else {
			this.geoCodificar2CodigosDeCalle(dir.getCalle().codigo, dir.getCalleCruce().codigo, success, error);			
		}
	},
	
	/**
	 * Realiza una geocodificacion a partir de un nombre oficial de calle y una altura valida para la misma
     * @param {String} calle Nombre oficial (exacto) de la calle.  
     * @param {Integer} altura Altura valida para la calle.
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
     * @param {String} metodo (optional) Metodo de geocodificacion a utilizar.   
    */	
	geoCodificarCalleAltura: function(calle, altura, success, error, metodo) {
		if (!altura.isInteger()) {
			throw('altura tiene que ser un entero');
			return;
		}
		var data = {
			cod_calle: calle,
			altura: altura
		}
		metodo = this.validarMetodo(metodo);
		if (metodo != undefined) {
			data.metodo = metodo;
		}
		this.mkRequest(data, this.onSuccess.createDelegate(this, [success], 1), error, this.opts.server+'geocoding/');
	},
	
	/**
	 * Realiza una geocodificacion a partir de un codigo de calle valido y una altura valida para la misma
     * @param {Integer} codCalle Codigo de calle valido.  
     * @param {Integer} altura Altura valida para la calle.
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
     * @param {String} metodo (optional) Metodo de geocodificacion a utilizar.   
    */	
	geoCodificarCodigoDeCalleAltura: function(codCalle, altura, success, error, metodo) {
		if (!codCalle.isInteger()) {
			throw('codCalle tiene que ser un entero');
			return;
		}
		if (!altura.isInteger()) {
			throw('altura tiene que ser un entero');
			return;
		}
		var data = {
			cod_calle: codCalle,
			altura: altura
		}
		metodo = this.validarMetodo(metodo);
		if (metodo != undefined) {
			data.metodo = metodo;
		}
		this.mkRequest(data, this.onSuccess.createDelegate(this, [success], 1), error, this.opts.server+'geocoding/');		
	},
	
	/**
	 * Realiza una geocodificacion a partir de dos nombres oficiales de calles que se cruzan
     * @param {String} calle1 Nombre oficial (exacto) de la primera calle.  
     * @param {String} calle2 Nombre oficial (exacto) de la segunda calle.  
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
    */	
	geoCodificarCalleYCalle: function(calle1, calle2, success, error) {
		var data = {
			cod_calle1: calle1,
			cod_calle2: calle2
		}
		this.mkRequest(data, this.onSuccess.createDelegate(this, [success], 1), error, this.opts.server+'geocoding/');		
	},
	
	/**
	 * Realiza una geocodificacion a partir de dos codigos de calles que se cruzan
     * @param {Integer} codCalle1 Codigo valido de la primera calle.  
     * @param {Integer} codCalle2 Codigo valido de la segunda calle.  
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
    */	
	geoCodificar2CodigosDeCalle: function(codCalle1, codCalle2, success, error) {
		if (!codCalle1.isInteger()) {
			throw('codCalle1 tiene que ser un entero');
			return;
		}
		if (!codCalle2.isInteger()) {
			throw('codCalle2 tiene que ser un entero');
			return;
		}
		var data = {
			cod_calle1: codCalle1,
			cod_calle2: codCalle2
		}
		this.mkRequest(data, this.onSuccess.createDelegate(this, [success], 1), error, this.opts.server+'geocoding/');				
	},
	
	/**
	 * Realiza una geocodificacion reversa de una coordenada geografica tanto en 
	 * latitud/longitud como en GKBA
	 * @param {Float} x Longitud
	 * @param {Float} y Latitud 
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro un objeto conteniendo los siguientes datos: 
     * {parcela: String, puerta: String, puerta_x: Float, puerta_y:Float, calle_alturas: String, 
     * esquina: String, metros_a_esquina: String, altura_par: String, altura_impar: String}
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
	 * @return {Object} 
	 */
	reverseGeoCoding: function(x, y, success, error) {
		var data = {
				x: x,
				y: y
		};
		this.mkRequest(data, success, error, this.opts.server+'reversegeocoding/')
	},
	
	/**
	 * Para obtener la Seccion Manzana Parcela dado un código de calle y una altura válida
	 * @param {Integer} cod_calle Código de la calle
	 * @param {Integer} altura Altura válida correspondiente a dicha calle
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la consulta.
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio. 
	 * @return {Object} 
	 */
	getSMP: function(cod_calle, altura, success, error) {
		var data = {
				cod_calle: cod_calle,
				altura: altura
		};
		this.mkRequest(data, success, error, this.opts.server+'smp/')
	}
	
});
//Fin jQuery noConflict support
})(jQuery);

usig.GeoCoder.defaults = {
	debug: false,
	// server: 'http://10.75.0.59/wk/GeoCoderServer/src/www/server.php/',
	server: '//ws.usig.buenosaires.gob.ar/geocoder/2.2/',
	metodo: undefined
}