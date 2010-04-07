// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class GeoCoder
 * Esta clase implementa una interfaz Javascript con el servicio de GeoCoding de USIG<br/>
 * Requiere: jQuery-1.3.2+, usig.core, usig.Punto
 * @namespace usig
 * @cfg {String} server Url del servicio de GeoCoding de USIG. Por defecto: 'http://usig.buenosaires.gov.ar/servicios/GeoCoder'.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @cfg {String} metodo Nombre del metodo de geocodificacion a utilizar si se omite el parametro en los metodos 
 * correspondientes. Si no se setea utiliza el metodo por defecto seteado en el servidor. 
 * <br/>Metodos de geocodificacion disponibles: 'interpolacion', 'puertas' y 'centroide'
 * <br/>Para mas informacion consultar: <a href="http://usig.buenosaires.gov.ar/servicios/GeoCoder">http://usig.buenosaires.gov.ar/servicios/GeoCoder</a>
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.GeoCoder = function(options) {
	
	var opts = $.extend({}, usig.GeoCoder.defaults, options);
	
	var metodos = ['interpolacion', 'puertas', 'centroide'];
	
	var mkRequest = function(data, success, error) {
		$.ajax({
			type: 'GET',
			url: opts.server,
			data: data,
			dataType: 'jsonp',
			success: function(res) {
				if (typeof(res) != "string") {
					success(new usig.Punto(res.x, res.y));
				} else {
					success(res);
				}
			},
			error: error
		});		
	}
	
	var validarMetodo = function(metodo) {
		if (metodo != undefined) {
			if (metodos.indexOf(metodo) >= 0) {
				return metodo;
			}
		} else if (opts.metodo != undefined) {
			return opts.metodo;
		}		
		return undefined;
	}
	
	/**
	 * Realiza una geocodificacion a partir de una instancia de usig.Direccion (NormalizadorDireccionesJS)
     * @param {usig.Direccion} dir Direccion a geocodificar.  
     * @param {String} metodo (optional) Metodo de geocodificacion a utilizar (solo aplicable a direcciones calle-altura).   
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
    */	
	this.geoCodificarDireccion = function(dir, success, error, metodo) {
		if (!(dir instanceof usig.Direccion)) {
			throw('dir debe ser una instancia de usig.Direccion');
			return;
		}
		if (dir.getTipo() == usig.Direccion.CALLE_ALTURA) {
			this.geoCodificarCodigoDeCalleAltura(dir.getCalle().codigo, dir.getAltura(), success, error, metodo);
		} else {
			this.geoCodificar2CodigosDeCalle(dir.getCalle().codigo, dir.getCalleCruce().codigo, success, error);			
		}
	}
	
	/**
	 * Realiza una geocodificacion a partir de un nombre oficial de calle y una altura valida para la misma
     * @param {String} calle Nombre oficial (exacto) de la calle.  
     * @param {Integer} altura Altura valida para la calle.
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
     * @param {String} metodo (optional) Metodo de geocodificacion a utilizar.   
    */	
	this.geoCodificarCalleAltura = function(calle, altura, success, error, metodo) {
		if (!altura.isInteger()) {
			throw('altura tiene que ser un entero');
			return;
		}
		var data = {
			cod_calle: calle,
			altura: altura
		}
		metodo = validarMetodo(metodo);
		if (metodo != undefined) {
			data.metodo = metodo;
		}
		mkRequest(data, success, error);
	}
	
	/**
	 * Realiza una geocodificacion a partir de un codigo de calle valido y una altura valida para la misma
     * @param {Integer} codCalle Codigo de calle valido.  
     * @param {Integer} altura Altura valida para la calle.
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
     * @param {String} metodo (optional) Metodo de geocodificacion a utilizar.   
    */	
	this.geoCodificarCodigoDeCalleAltura = function(codCalle, altura, success, error, metodo) {
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
		metodo = validarMetodo(metodo);
		if (metodo != undefined) {
			data.metodo = metodo;
		}
		mkRequest(data, success, error);		
	}
	
	/**
	 * Realiza una geocodificacion a partir de dos nombres oficiales de calles que se cruzan
     * @param {String} calle1 Nombre oficial (exacto) de la primera calle.  
     * @param {String} calle2 Nombre oficial (exacto) de la segunda calle.  
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
    */	
	this.geoCodificarCalleYCalle = function(calle1, calle2, success, error) {
		var data = {
			cod_calle1: calle1,
			cod_calle2: calle2
		}
		mkRequest(data, success, error);		
	}
	
	/**
	 * Realiza una geocodificacion a partir de dos codigos de calles que se cruzan
     * @param {Integer} codCalle1 Codigo valido de la primera calle.  
     * @param {Integer} codCalle2 Codigo valido de la segunda calle.  
     * @param {Function} success Funcion callback que es llamada al concretarse con exito la geocodificacion.
     * Recibe como parametro una instancia de usig.Punto. 
     * @param {Function} error Funcion callback que es llamada si falla la comunicacion con el servicio de geocodificacion. 
    */	
	this.geoCodificar2CodigosDeCalle = function(codCalle1, codCalle2, success, error) {
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
		mkRequest(data, success, error);				
	}
}

usig.GeoCoder.defaults = {
	debug: false,
	server: 'http://usig.buenosaires.gov.ar/servicios/GeoCoder',
	metodo: undefined
}