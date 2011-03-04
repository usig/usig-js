// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class IndiceCatastral
 * Esta clase implementa una interfaz Javascript con el servicio del Indice Catastral de USIG<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, json, jquery.jsonp-1.1.0.1+, usig.core, usig.AjaxComponent, usig.SeccionCatastral, usig.ManzanaCatastral, usig.ParcelaCatastral<br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/tests/IndiceCatastral.html">http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/tests/IndiceCatastral.html</a>
 * @namespace usig
 * @cfg {String} server Url del servicio del Indice Catastral de USIG. Por defecto: 'http://inventario.usig.buenosaires.gob.ar/catastro/'.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Boolean} buscarSMP Si es true busca por SMP
 * @cfg {Boolean} buscarPM Si es true busca por PM
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
usig.IndiceCatastral = usig.AjaxComponent.extend({
	
	init: function(options) {
		var opts = $.extend({}, usig.IndiceCatastral.defaults, options);		
		this._super('IndiceCatastral', usig.IndiceCatastral.defaults.server, opts);
		this.showDebug('Creando instancia de usig.IndiceCatastral');
	},
	
	/**
	 * Permite buscar en forma asincronica un texto cualquiera en el indice catastral
	 * @param {String} text Texto a buscar
	 * @param {Function} success Funcion que es llamada con el resultado de la busqueda
	 * @param {Function} error Funcion que es llamada en caso de error
	 * @param {Integer} maxSug Maximo numero de sugerencias a devolver
	 */
	buscar: function(text, success, error, maxSug) {
//		var regExpSMP = /^([0-9]{2})-([0-9]{3}[A-Z]?)-([A-Z0-9]{3,4})$/;
		var regExpSMP = /^([0-9]{2})-([0-9]{3}[A-Z]?)-([A-Z0-9]{0,4})$/;
		var regExpSM  = /^([0-9]{2})-([0-9]{0,3}|[0-9]{3}[A-Z])$/;
		var regExpSoPM = /^([0-9]{1,6})$/;
		var regExpS   = /^([0-9]{1,2})$/;
		var regExpPM  = /^([1-9][0-9]{0,5})$/;
		
		var text = text.toUpperCase();
		var maxSug = maxSug!=undefined?maxSug:this.opts.maxSuggestions;
		
		this.showDebug('-=-=-= Busqueda: '+text+' =-=-=-');
		
		function onSuccess (results, success, maxSug){
			var newResults = [];
			var maxSug = Math.min(results.datos.length, maxSug);
			
			for (i=0; i<maxSug; i++){
				if (results.tipo == 'P'){
					newResults.push(new usig.ParcelaCatastral(results.datos[i]));
				}else if (results.tipo == 'M'){
					newResults.push(new usig.ManzanaCatastral(results.seccion+'-'+results.datos[i]));
				}else if (results.tipo == 'S'){
					newResults.push(new usig.SeccionCatastral(results.datos[i]));
				}
			}
			this.showDebug(newResults);

			if (typeof(success) == "function") {	
				success(newResults);
			}
		}
		
		if ((resMatch = text.match(regExpSMP)) && this.opts.buscarSMP){
			this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, maxSug], 1), error, this.opts.server + 'smp/'+resMatch[1]+'/'+resMatch[2]+'/'+resMatch[3]);
		}else if ((resMatch = text.match(regExpSM)) && this.opts.buscarSMP){
			this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, maxSug], 1), error, this.opts.server + 'smp/'+resMatch[1]+'/'+resMatch[2]);
		}else if (resMatch = text.match(regExpSoPM)){
			var matcheo = false;
			if ((text.match(regExpPM)) && this.opts.buscarPM){
				this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, maxSug], 1), error, this.opts.server + 'pm/'+resMatch[1]);
				matcheo = true;
			}
			if ((text.match(regExpS)) && this.opts.buscarSMP){
				this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, maxSug], 1), error, this.opts.server + 'smp/'+resMatch[1]);
				matcheo = true;
			}
			if (!matcheo){
				throw(new usig.IndiceCatastral.WrongParameters);
			}
		}else if (text == '' && this.opts.buscarSMP){
			this.lastRequest = this.mkRequest(null, onSuccess.createDelegate(this, [success, maxSug], 1), error, this.opts.server + 'smp/');
		}else{
			throw(new usig.IndiceCatastral.WrongParameters());
		}
		return;
	},

	/**
	 * Permite abortar la ultima consulta realizada
	 */
	abort: function() {
		if (this.lastRequest) {
			this.lastRequest.abort();
			this.lastRequest = null;
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

usig.IndiceCatastral.WrongParameters = function() {
	this.msg = 'Los parametros ingresados son incorrectos.';
	this.getErrorMessage = function() {
		return this.msg;
	}
}

usig.IndiceCatastral.defaults = {
	debug: false,
//	server: 'http://inventario.usig.buenosaires.gob.ar/catastro/',
	server: 'http://panda-dev.usig.gcba.gov.ar:8000/',
	maxSuggestions: 10,
	buscarSMP: true,
	buscarPM: true
}