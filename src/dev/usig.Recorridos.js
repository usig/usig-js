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
	
	getUbicacion: function(place) {
		var ubicacion = { coordenadas: "", codigo_calle: 0, altura: 0 };
		if (place.x != undefined && place.y != undefined) {
			ubicacion.coordenadas = place.x+","+place.y;
		}
		
		if (usig.Direccion && place instanceof usig.Direccion) {
			ubicacion.coordenadas = place.getCoordenadas().x+","+place.getCoordenadas().y;
			ubicacion.codigo_calle = place.getCalle().codigo;
			ubicacion.altura = place.getAltura();
		}
		
		if (usig.inventario && usig.inventario.Objeto && place instanceof usig.inventario.Objeto) {
			if (place.direccionAsociada) {
				ubicacion.coordenadas = place.direccionAsociada.getCoordenadas().x+","+place.direccionAsociada.getCoordenadas().y;
				ubicacion.codigo_calle = place.direccionAsociada.getCalle().codigo;
				ubicacion.altura = place.direccionAsociada.getAltura();
			} else {
				ubicacion.coordenadas = place.ubicacion.getCentroide().x+","+place.ubicacion.getCentroide().y;
			}
		}	
		
		if (usig.DireccionMapabsas && place instanceof usig.DireccionMapabsas) {
			ubicacion.codigo_calle = place.cod;
			ubicacion.altura = place.alt;
		}
		return ubicacion;
	},
	
	onBuscarRecorridosSuccess: function(data, callback) {
		
	},
	
	/*
	 * Dado un determinado tripPlan busca el detalle del mismo
	 * @param {Object} data: {trip_id: int} el id del trip_plan
	 * @param {Function} success Funcion callback que es llamada con el listado de categorias obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 */
	loadTripPlan: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'load_plan');
	},
		
	/* 
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
     *		{Boolean} opciones_incluir_autopistas: Es true si se deben tomar en cuenta las autopistas <br/>
	 * @param {String} tipo: Toma los valores 'transporte', 'auto' o 'pie'
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 */
	consultarRecorridos: function(data, tipo, success,error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'recorridos_' + tipo);
	},
	
	/*
	 * Dada una ubicacion trae informacion del transporte que pasa por esa ubicacion
	 * @param {Object} data Objeto que contiene las coordenadas xy de la ubicacion
	 * @param {Function} success Funcion callback que es llamada con el listado de categorias obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 */
	InfoTransporte: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'info_transporte/');		
	},
	
	/**
	 * Dadas dos ubicaciones origen/destino y ciertas opciones de busqueda consulta los recorridos posibles.
	 * @param {usig.Direccion/usig.inventario.Objeto/usig.DireccionMapabsas/usig.Punto} origen Origen del recorrido
	 * @param {usig.Direccion/usig.inventario.Objeto/usig.DireccionMapabsas/usig.Punto} destino Destino del recorrido
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 * 
	 */
	buscarRecorridos: function(origen, destino, success, error, options) {
		var data = $.extend({}, usig.Recorridos.defaults, options);
		ubicacionOrigen = this.getUbicacion(origen);
		data.origen = ubicacionOrigen.coordenadas;
		data.origen_calles = ubicacionOrigen.codigo_calle;
		data.origen_calle_altura = ubicacionOrigen.altura;
		ubicacionDestino = getUbicacion(destino);
		data.destino = ubicacionDestino.coordenadas;
		data.destino_calles = ubicacionDestino.codigo_calle;
		data.destino_calle_altura = ubicacionDestino.altura;
		this.lastRequest = this.mkRequest(data, this.onBuscarRecorridosSuccess.createDelegate(this, [success], 1), error, this.opts.server + 'recorridos_' + data.tipo_recorrido);		
	}

	
});
	
usig.Recorridos.defaults = {
	debug: false,
	server: 'http://recorridos.usig.buenosaires.gob.ar/',
	serverTimeout: 5000,
	maxRetries: 5,	
	tipo_recorrido: 'transporte',
	opciones_caminata: 800,
	opciones_medios_colectivo: true,
	opciones_medios_subte: true,
	opciones_medios_tren: true,
	opciones_prioridad: 'avenidas', 
	opciones_incluir_autopistas: true
}