// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.defaults) == "undefined")
	usig.defaults = {};

usig.TripTemplate = function(index, color) {	
	this.index = index;
	this.color = color;
	this.cls = 'trip_' + index;
}	
	
usig.defaults.Recorridos = {
	debug: false,
	trackVisits: true,
	piwikBaseUrl: '//usig.buenosaires.gob.ar/piwik/',
	piwikSiteId: 4, 
	server: '//recorridos.usig.buenosaires.gob.ar/2.0/',
	serverTimeout: 30000,
	maxRetries: 2,
	lang: 'es',
	consultaRecorridos: {
		tipo: 'transporte',
		gml: true,
		precargar:3,
		opciones_caminata: 800,
		opciones_medios_colectivo: true,
		opciones_medios_subte: true,
		opciones_medios_tren: true,
		opciones_prioridad: 'avenidas', 
		opciones_incluir_autopistas: true,
		opciones_cortes: true,
		max_results:10
	},
	colorTemplates: [
		new usig.TripTemplate(1, '#0074FF'),
		new usig.TripTemplate(2, '#DD0083'),
		new usig.TripTemplate(3, '#009866'),
		new usig.TripTemplate(4, '#FF9E29'),
		new usig.TripTemplate(5, '#FF6633'),
		new usig.TripTemplate(6, '#5B3BA1'),
		new usig.TripTemplate(7, '#98C93C'),
		new usig.TripTemplate(8, '#EE3A39'),
		new usig.TripTemplate(9, '#4ED5F9'),
		new usig.TripTemplate(10,'#FFCC05'),
		new usig.TripTemplate(11, '#84004F'),
		new usig.TripTemplate(12, '#00A5EB'),
		new usig.TripTemplate(13, '#016406'),
		new usig.TripTemplate(14, '#AB62D2'),
		new usig.TripTemplate(15, '#C49F25'),
		new usig.TripTemplate(16, '#9F2510'),
		new usig.TripTemplate(17, '#0003CF'),
		new usig.TripTemplate(18, '#CBA4FA'),
		new usig.TripTemplate(19, '#00FFC9'),
		new usig.TripTemplate(20, '#DC6767')
	]
};	
	
/**
 * @class Recorridos
 * Esta clase implementa una interfaz Javascript con los servicios de recorridos de la USIG<br/>
 * Requiere: jQuery-1.3.2+, jQuery-jsonp-1.1.0.1+, usig.core, usig.AjaxComponent, usig.Recorrido<br/>
 * Demo: <a href="http://servicios.usig.buenosaires.gob.ar/usig-js/3.1/demos/recorridos.html">http://servicios.usig.buenosaires.gob.ar/usig-js/3.1/demo/recorridos.html</a><br/>
 * @namespace usig
 * @cfg {String} server Url del servidor de recorridos. Por defecto: 'http://recorridos.usig.buenosaires.gob.ar/'
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout 
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {String} tipo Indica el tipo de recorrido a buscar. Las opciones posibles son: 'transporte' (default), 
 * 'auto' o 'pie'
 * @cfg {Integer} opciones_caminata Indica la cantidad de metros que se esta dispuesto a caminar para tomar un transporte
 * publico
 * @cfg {Boolean} opciones_medios_colectivo Indica si se debe considerar los colectivos al buscar recorridos en transporte
 * publico (por defecto es True)
 * @cfg {Boolean} opciones_medios_subte Indica si se debe considerar los subtes al buscar recorridos en transporte
 * publico (por defecto es True)
 * @cfg {Boolean} opciones_medios_tren Indica si se debe considerar los trenes al buscar recorridos en transporte
 * publico (por defecto es True)
 * @cfg {Boolean} opciones_prioridad Indica la prioridad al buscar recorridos en auto. Las opciones posibles son: 'avenidas' (default)
 * y 'corto' (prioriza la distancia mas corta)
 * @cfg {Boolean} opciones_incluir_autopistas Indica si se debe considerar las autopistas al buscar recorridos en auto (por defecto es True)
 * @cfg {Boolean} gml Indica si se desea obtener el GML asociado al consultar el detalle de un recorrido (por defecto es True). 
 * Debe tenerse presente que de no cargar el GML el recorrido no podra visualizarse en un mapa.
 * @cfg {Integer} precargar Indica cuantos planes se desea precargar al consultar recorridos para evitar tener que realizar otra
 * consulta al servidor para obtener el detalle de un recorrido (por defecto 3)
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
 * @singleton
*/	
usig.Recorridos = (function($) { // Soporte jQuery noConflict
return new (usig.AjaxComponent.extend({
	
	lastRequest: null,
	
	/**
	 * Permite inicializar la clase pasandole overrides para las opciones por defecto
	 * @param {Object} options (optional) Objeto conteniendo overrides para las opciones por defecto
	 * @return {Object} Devuelve una referencia a la clase
	 */
	init: function(options) {
		var opts = $.extend({}, usig.defaults.Recorridos, options);
		opts.consultaRecorridos = $.extend({}, usig.defaults.Recorridos.consultaRecorridos, options);
		this._super('Recorridos', usig.defaults.Recorridos.server, opts);	
		var trackVisits = function(idSite) {
			try {
				var piwikTracker = Piwik.getTracker(opts.piwikBaseUrl + "piwik.php", idSite);
				piwikTracker.trackPageView();
				piwikTracker.enableLinkTracking();
			} catch( err ) {}
		};
		if (usig.Recorridos && opts.trackVisits) {
			if (typeof(Piwik) == "undefined") {	
				usig.loadJs(opts.piwikBaseUrl+'piwik.js', trackVisits.createDelegate(this,[opts.piwikSiteId]));
			} else {
				trackVisits(opts.piwikSiteId);
			}			
		}
		return this;
	},
	
	getUbicacion: function(place) {
		var ubicacion = { coordenadas: {x: 0, y: 0}, codigo_calle: 0, altura: 0 , codigo_calle2: 0};
		if (place.x != undefined && place.y != undefined) {
			ubicacion.coordenadas = place;
		}
		
		if (usig.Direccion && place instanceof usig.Direccion) {
			if(place.getTipo() == usig.Direccion.CALLE_Y_CALLE){
				ubicacion.codigo_calle2 = place.getCalleCruce().codigo;
			}
			ubicacion.coordenadas = place.getCoordenadas();
			ubicacion.codigo_calle = place.getCalle().codigo;
			ubicacion.altura = place.getAltura();
		}
		
		if (usig.inventario && usig.inventario.Objeto && place instanceof usig.inventario.Objeto) {
			if (place.direccionAsociada) {
				ubicacion.coordenadas = place.direccionAsociada.getCoordenadas();
				ubicacion.codigo_calle = place.direccionAsociada.getCalle().codigo;
				ubicacion.altura = place.direccionAsociada.getAltura();
			} else {
				ubicacion.coordenadas = place.ubicacion.getCentroide();
			}
		}	
		
		if (usig.DireccionMapabsas && place instanceof usig.DireccionMapabsas) {
			if(place.tipo == usig.Direccion.CALLE_Y_CALLE){
				ubicacion.codigo_calle2 = place.cod_calle_cruce;
			}
			ubicacion.codigo_calle = place.cod;
			ubicacion.altura = place.alt;
		}
		return ubicacion;
	},
	
	onBuscarRecorridosSuccess: function(data, callback) {
		var recorridos = [], templates = this.opts.colorTemplates, lang = this.opts.lang;
		if (this.opts.debug) usig.debug('usig.Recorridos onBuscarRecorridosSuccess');
		$.each(data.planning, function(i, plan) {			
			var trip_plan = JSON.parse(plan);
			
			switch (trip_plan.type){
				case 'car':template = templates[1]; break;//fuccia
				case 'bike':template = templates[0];break;//azul
				case 'walk':template = templates[2]; break;//verde
				case 'transporte_publico': template = templates[i];break;
			}
			recorridos.push(new usig.Recorrido(JSON.parse(plan), { template: template, lang: lang }));
			//recorrido.loadPlan
		});
		if (typeof(callback) == "function")
			callback(recorridos);
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
	 * @param {Function} success Funcion callback que es llamada cuando se obtiene una respuesta exitosa del servidor. 
	 * Recibe como parametro un Array(usig.Recorrido) con las opciones encontradas.
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
	 */
	buscarRecorridos: function(origen, destino, success, error, options) {
		var data = $.extend({}, this.opts.consultaRecorridos, options);
		var ubicacionOrigen = this.getUbicacion(origen);
		if (ubicacionOrigen.coordenadas){
			
			data.origen = ubicacionOrigen.coordenadas.x+','+ubicacionOrigen.coordenadas.y;	
		}
		data.origen_calles2 = ubicacionOrigen.codigo_calle2;
		data.origen_calles = ubicacionOrigen.codigo_calle;
		data.origen_calle_altura = ubicacionOrigen.altura;
		var ubicacionDestino = this.getUbicacion(destino);
		if (ubicacionDestino.coordenadas){
			
			data.destino = ubicacionDestino.coordenadas.x+','+ubicacionDestino.coordenadas.y;	
		}

		data.destino_calles2 = ubicacionDestino.codigo_calle2;
		data.destino_calles = ubicacionDestino.codigo_calle;
		data.destino_calle_altura = ubicacionDestino.altura;
		//this.lastRequest = this.mkRequest(data, this.onBuscarRecorridosSuccess.createDelegate(this, [success], 1), error, this.opts.server + 'recorridos_' + data.tipo_recorrido);		
		this.lastRequest = this.mkRequest(data, this.onBuscarRecorridosSuccess.createDelegate(this, [success], 1), error, this.opts.server + 'consultar_recorridos');

	},
	
	cargarPlanRecorrido: function(id, success, error, options) {
		//this.lastRequest = this.mkRequest({trip_id: id}, success, error, this.opts.server + 'load_plan');
		var data = $.extend({}, this.opts.consultaRecorridos, options);
		data.trip_id = id;
		data.tipo = 'loadplan';

		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'consultar_recorridos');
	},
	
	/**
	 * Permite consultar los transportes cercanos a una ubicacion dada.
	 * @param {usig.Direccion/usig.inventario.Objeto/usig.DireccionMapabsas/usig.Punto} lugar Lugar a consultar
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 * 
	 */
	transportesCercanos: function(lugar, success, error) {
		var ubicacion = this.getUbicacion(lugar);
		var data = { x: ubicacion.coordenadas.x, y: ubicacion.coordenadas.y };
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'info_transporte/');		
	},
	
	/**
	 * Permite consultar las ciclovias cercanas a una ubicacion dada.
	 * @param {usig.Direccion/usig.inventario.Objeto/usig.DireccionMapabsas/usig.Punto} lugar Lugar a consultar
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor
	 * @param {Function} error Funcion callback que es llamada en caso de error
	 * @param {Object} options (optional) Un objeto conteniendo opciones. Las opciones disponibles son:
	 * <b>radio</b> en metros (por defecto sin limite) y <b>cantidad</b> de resultados a obtener
	 * (por defecto 5) 
	 */
	cicloviasCercanas: function(lugar, success, error, options) {
		var ubicacion = this.getUbicacion(lugar);
		var data = { lon: ubicacion.coordenadas.x, lat: ubicacion.coordenadas.y };
		if (options) {
			if (options.radio) data.radio = options.radio;
			if (options.cantidad) data.cantidad = options.cantidad;
		}
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'ciclovias_cercanas/');		
	}
	
}));
//Fin jQuery noConflict support
})(jQuery);
