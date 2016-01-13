// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class NormalizadorAMBA
 * Esta clase implementa una interfaz Javascript con el servicio de Normalizacion de Direcciones de USIG<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, json, jquery.jsonp-1.1.0.1+, usig.core, usig.AjaxComponent<br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/tests/IndiceCatastral.html">http://servicios.usig.buenosaires.gov.ar/usig-js/3.0/tests/IndiceCatastral.html</a>
 * @namespace usig
 * @cfg {String} server Url del servicio del Normalizador de Direcciones de USIG. Por defecto: 'http://inventario.usig.buenosaires.gob.ar/catastro/'.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.<br/>
 * Para mas informacion consultar: <a href="http://usig.buenosaires.gov.ar/servicios/IndiceCatastral">http://usig.buenosaires.gov.ar/servicios/IndiceCatastral</a>
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.NormalizadorAMBA = (function($) { // Soporte jQuery noConflict
return usig.AjaxComponent.extend({
	
	init: function(options) {
		var opts = $.extend({}, usig.NormalizadorAMBA.defaults, options);
		this._super('NormalizadorAMBA', usig.NormalizadorAMBA.defaults.server, opts);
		this.showDebug('Creando instancia de usig.NormalizadorAMBA');
	},
	
	/**
	 * Permite buscar en forma asincronica un texto cualquiera en el indice catastral
	 * @param {String} text Texto a buscar
	 * @param {Function} success Funcion que es llamada con el resultado de la busqueda
	 * @param {Function} error Funcion que es llamada en caso de error
	 * @param {Integer} maxSug Maximo numero de sugerencias a devolver
	 */
	buscar: function(text, success, error, maxSug) {
		
		var text = text;
		var maxSug = maxSug!=undefined?maxSug:this.opts.maxSuggestions;
		var options = usig.data.Callejero?this.opts.options:{};
		
		this.showDebug('-=-=-= Busqueda: '+text+' =-=-=-');
		
		function onSuccess (results, success, maxSug){
			var newResults = [];
			var maxSug = Math.min(results.direccionesNormalizadas.length, maxSug);
			
			for (i=0; i<maxSug; i++){
				res = results.direccionesNormalizadas[i]
				if (res.tipo == 'calle'){
					var sug = new usig.Calle(res.cod_calle, res.nombre_calle, [], []);
					sug.partido = res.nombre_partido;
					sug.descripcion = res.nombre_localidad + ', ' +res.nombre_partido;
				}else{
					var sug = usig.Direccion.fromObj(res);
				}
				newResults.push(sug);
				this.showDebug(res);
				this.showDebug(sug);
			}

			if (typeof(success) == "function") {	
				success(newResults);
			}
		}

		if (text != ''){
			this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, maxSug], 1), error, this.opts.server +'?'+$.param(options) + '&maxOptions='+maxSug+'&direccion='+text);
		}else{
			throw(new usig.NormalizadorAMBA.WrongParameters());
		}
		return;
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
		var options = usig.data.Callejero?this.opts.options:{};
		if (!(dir instanceof usig.Direccion)) {
			throw('dir debe ser una instancia de usig.Direccion');
			return;
		}
		
		function onSuccess (results, success, dir){
			for (i=0; i<results.direccionesNormalizadas.length; i++){
				res = results.direccionesNormalizadas[i]
				if ((res.cod_calle == dir.getCalle().codigo) && ((res.cod_calle_cruce!= null && res.cod_calle_cruce == dir.getCalleCruce().codigo) || (res.altura == dir.getAltura()))) {
					p = new usig.Punto(res.coordenadas.x, res.coordenadas.y);
					success(p);
				}
			}
		}

		urlServiceCall = this.opts.server+'?'+$.param(options)+'&geocodificar=True&direccion='+dir.toString();
		this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, dir], 1), error, urlServiceCall);
	},
	
	/**
	 * Permite abortar la ultima consulta realizada
	 */
	abort: function() {
		if (this.lastRequest && false) {
			this.lastRequest.abort();
			this.lastRequest = null;
	       	if (typeof(this.opts.afterAbort) == "function") {
	       		this.opts.afterAbort();
	       	}
		}
	},
	
	/**
	 * Muestra informacion de debugging en la consola.
	 * Requiere soporte para window.console.log.
	 * La informacion se muestra si this.opts.debug es True
	 * @param {String} toShow Texto a mostrar
	 */
	showDebug: function(toShow){
		if (this.opts.debug){
			usig.debug(toShow);
		}
	}

});
//Fin jQuery noConflict support
})(jQuery);

usig.NormalizadorAMBA.WrongParameters = function() {
	this.msg = 'Los parametros ingresados son incorrectos.';
	this.getErrorMessage = function() {
		return this.msg;
	}
};

usig.NormalizadorAMBA.defaults = {
	debug: false,
	options: {
		'exclude': 'caba'
	},
	server: '//servicios.usig.buenosaires.gob.ar/normalizar',
	// server: 'http://10.9.6.112/normalizar?exclude=caba',
	maxSuggestions: 10,
	serverTimeout: 5000,
	maxRetries: 3,
};
