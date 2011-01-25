// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Recorridos
 * Esta clase implementa una interfaz Javascript con los servicios de recorridos de la USIG<br/>
 * Requiere: jQuery-1.3.2+, jQuery-jsonp-1.1.0.1+, usig.core, usig.AjaxComponent<br/>
 * @namespace usig
 * @cfg {String} server Url del servidor de recorridos. Por defecto: 'http://recorridos.usig.buenosaires.gob.ar/'
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.Recorridos = usig.AjaxComponent.extend({
	
	lastRequest: null,
	
	init: function(options) {
		var opts = $.extend({}, usig.Recorridos.defaults, options);		
		this._super('Recorridos', usig.Recorridos.defaults.server, opts);		
	},
	
	/**
	 * Dado un determinado tripPlan busca el detalle del mismo
	 * @param {Object} data: {trip_id: int} el id del trip_plan
	 * @param {Function} success Funcion callback que es llamada con el listado de categorias obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 */
	loadTripPlan: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'load_plan');
	},
		
	/** 
	 * Dadas dos ubicaciones origen/destino y ciertas opciones de busqueda consulta los recorridos posibles.
	 * @param {Object} data Objeto que contiene datos del origen y destino, asi como las opciones de busqueda: <br/>
	 * 		{String} action: (ej: "http://recorridos.usig.buenosaires.gob.ar/recorridos_transporte") <br/>
     *		{String} destino: son las coordenadas xy de la ubicacion destino separadas por "," <br/>
     *		{int} destino_calle_altura: Altura de la calle destino. Si la ubicacion no tiene Dir es vacio <br/>
     *		{int} destino_calles: Codigo de la calle destino. Si la ubicacion no tiene Dir es cero <br/>
     *		{String} origen: son las coordenadas xy de la ubicacion origen separadas por "," <br/>
     *		{int} origen_calle_altura: Altura de la calle origen. Si la ubicacion no tiene Dir es vacio <br/>
     *		{int} origen_calles: Codigo de la calle origen. Si la ubicacion no tiene Dir es cero <br/>
     *		Si la consulta es de transporte publico: <br/>
     *		{int} opciones_caminata: Caminata maxima <br/>
     *		{boolean} opciones_medios_colectivo: Es true si esta marcada la opcion de tener en cuenta colectivos para buscar el recorrido <br/>
     *		{boolean} opciones_medios_subte: Es true si esta marcada la opcion de tener en cuenta subtes para buscar el recorrido <br/>
     *		{boolean} opciones_medios_tren: Es true si esta marcada la opcion de tener en cuenta trenes para buscar el recorrido <br/>
     *		Si la consulta es de recorrido en auto: <br/>
     *		{String} opciones_prioridad: Toma los valores "avenidas" o "corto" <br/>
	 * @param {String} tipo: Toma los valores 'transporte', 'auto' o 'pie'
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 */
	consultarRecorridos: function(data, tipo, success,error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'recorridos_' + tipo);
	},
	
	/**
	 * Dada una ubicacion trae informacion del transporte que pasa por esa ubicacion
	 * @param {Object} data Objeto que contiene las coordenadas xy de la ubicacion
	 * @param {Function} success Funcion callback que es llamada con el listado de categorias obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 */
	InfoTransporte: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'info_transporte/');		
	}
	

	
});
	
usig.Recorridos.defaults = {
	debug: false,
	server: 'http://recorridos.usig.buenosaires.gob.ar/'
	
}