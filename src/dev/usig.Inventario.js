// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Inventario
 * Esta clase implementa una interfaz Javascript con los servicios del Inventario de Informacion Geografica de la USIG<br/>
 * Requiere: jQuery-1.3.2+, jQuery-jsonp-1.1.0.1+, usig.core, usig.inventario.Objeto, usig.inventario.Ubicacion, 
 * usig.inventario.Clase, usig.AjaxComponent<br/>
 * Tests de Unidad: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/tests/inventario.html">http://servicios.usig.buenosaires.gov.ar/usig-js/2.0/tests/inventario.html</a>
 * @namespace usig
 * @cfg {String} server Url del servidor de informacion publica del Inventario de Informacion Geografica de USIG. Por defecto: 'http://inventario.usig.buenosaires.gob.ar/mapabsas/'.
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
usig.Inventario = usig.AjaxComponent.extend({
	
	lastRequest: null,
	
	init: function(options) {
		var opts = $.extend({}, usig.Inventario.defaults, options);		
		this._super('Inventario', usig.Inventario.defaults.server, opts);		
	},
	
	/**
	 * Permite obtener el listado de categorias de busqueda
	 * @param {Function} success Funcion callback que es llamada con el listado de categorias 
	 * obtenido del servidor
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getCategorias: function(success, error) {
		this.lastRequest = this.mkRequest({}, success, error, this.opts.server + 'getCategorias/');
	},
		
	/**  SE USA??????????
	 * Dado un objeto usig.UbicacionMapabsas permite obtener el smp correspondiente si existe 
	 * @param {usig.Direccion} dir Direccion de la que se desea averiguar el smp 
	 * @param {Function} success Funcion callback que es llamada con el resultado 
	 * obtenido del servidor
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getParcelaPorDir: function(dir, success, error) {
		this.lastRequest = this.mkRequest({cod_calle: dir.cod,  altura: dir.alt}, success, error, this.opts.server + 'getParcela/');
	},

	/**
	 * Dado una ubicacion trae del inventario informacion de esa ubicacion.
	 * @param {Object} data Objeto que contiene datos de la ubicacion sobre la que se requiere informacion
	 * data es {x: coordenadaX, y:coordenadaY, cod_calle: int (o 0 si es un lugar sin direccion), altura: int (o '' si es un lugar sin direccion)};
	 * @param {Function} success Funcion callback que es llamada con el resultado 
	 * obtenido del servidor
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getDir: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'getDir/');
	},
	
	/**
	 * Dado una ubicacion busca en el inventario cierta informacion de esa ubicacion segun los parametros que reciba. 
	 * @param {Object} data contiene la siguiente informacion: <br/>
	 * 		Si loadDatos es vacio debe tener: <br/> 
	 * 		{int} cod_calle Codigo de calle  <br/> 
	 * 		{int} altura Altura de calle <br/> 
	 * 		Si loadDatos no es vacio debe tener: <br/>
	 * 		{SMP} smp Seccion-manzana-parcela de la ubicacion 
	 * @param {string} loadDatos puede ser "FichaTecnica", "DatosZona" o "Actividades", o puede ser vacio. 
	 * @param {Function} success Funcion callback que es llamada con el resultado 
	 * obtenido del servidor
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getParcela: function(data, loadDatos, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'getParcela' +  loadDatos + '/');
	},

	
	/**
	 * Devuelve la informacion de transporte asociada a la ubicacion
	 * @param {Object} data Objeto que contiene datos de la ubicacion sobre la que se requiere informacion de transporte
	 * 		data puede contener alguno de los siguientes datos:
	 * 		{int} x Coordenada x de la ubicacion
	 * 		{int} y Coordenada y de la ubicacion
	 * 		{int} id Es el id del objecto 
	 * @param {Function} success Funcion callback que es llamada con el resultado 
	 * obtenido del servidor
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getDatosTransporte: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'getDatosTransporte/');
	},
	
	/**
	 * Permite buscar un texto cualquiera en el inventario
	 * @param {String} text Texto a buscar
	 * @param {Function} success Funcion que es llamada con el resultado de la busqueda
	 * @param {Function} error Funcion que es llamada en caso de error
	 * @param {Object} options (optional) Opciones para la busqueda. Las opciones validas son: <br/>
	 *    {Integer} start: Retorna resultados a partir del indicado
	 *    {Integer} limit: Retorne hasta esa cantidad de resultados
	 *    {String} tipoBusqueda: Puede ser "categoria" o "ranking" e indica la forma en que se obtienen los resultados
	 *    {String} clase: En caso de especificarse solo hace la busqueda sobre la clase de objetos indicada
	 *    {Object} bbox: Extent que permite realizar busqueda restringidas geograficamente
	 */
	buscar: function(text, success, error, options) {

		function buscarResultsHandler (results, callback) {
			var clases = {}, objetos = [];
			
			$.each(results.clasesEncontradas, function(i, clase) {
				clases[clase.id] = new usig.inventario.Clase(clase.id, clase.nombre, clase.nombreId, clase.nombreNorm);
			});
			
			$.each(results.instancias, function(i, obj) {
				objetos.push(new usig.inventario.Objeto(obj, clases[obj.claseId]));
			});
			
			if (typeof(callback) == "function") {
				callback(objetos);
			}
		}
		
		var ops = $.extend({}, usig.Inventario.defaults.searchOptions, options),
			data = { start:ops.start, limit: ops.limit, texto: text, tipo:ops.tipoBusqueda };
		
		if(ops.categoria != undefined)
			data['categoria'] = ops.categoria;
		
		if(ops.clase != undefined)
			data['clase'] = ops.clase;
		
		if(ops.bbox) { 
			data['bbox'] = [ops.extent.left,ops.extent.bottom,ops.extent.right,ops.extent.top].join(",");
		}
		
		
		var onSuccess = buscarResultsHandler.createDelegate(this, [success], 1); 
		
		if (ops.returnRawData) {
			onSuccess = success;
		}
		
		this.lastRequest = this.mkRequest(data, onSuccess, error, this.opts.server + 'buscar/');
	}, 	
	
	/**
	 * Dado un resultado de busqueda permite obtener un objeto de inventario completo con todos sus
	 * atributos
	 * @param {Object} obj Objeto obtenido a partir de una busqueda
	 * @param {Function} success Funcion que es llamada con el objeto obtenido de la consulta
	 * @param {Function} error (optional) Funcion que es llamada en caso de error
	 */
	getObjeto: function(obj, success, error) {
	
		function getObjetoResultsHandler (result, callback, obj) {
			if (obj instanceof usig.inventario.Objeto) {
				if (this.opts.debug) usig.debug('Completando el objeto recibido');
				obj.fill(result);
				callback(obj);
			} else {
				if (this.opts.debug) usig.debug('Creando objeto nuevo');
				callback(new usig.inventario.Objeto(result));
			}
		}
		
		var id = parseInt(obj)?parseInt(obj):parseInt(obj.id);
		if (id > 0) {
			this.lastRequest = this.mkRequest({ id: id }, getObjetoResultsHandler.createDelegate(this, [success, obj], 1), error, this.opts.server + 'getObjectContent/');						
		}
	},
	
	
	/**
	 * Dado un id de objeto busca informacion en inventario
	 * @param {Object} data Contiene el id del objeto
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor 
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getFeatureInfo: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'getObjectContent/');
	},
	
	
	/**
	 * Dada una coordenada devuelve los objetos cercanos
	 * @param {Object} data Contiene
	 * @param {Function} success Funcion callback que es llamada con el resultado obtenido del servidor 
	 * @param {Function} error (optional) Funcion callback que es llamada en caso de error
	 */
	getCloseFeatures: function(data, success, error) {
		this.lastRequest = this.mkRequest(data, success, error, this.opts.server + 'objetosCercanos/');
	},
	
	/**
	 * Dado el id de un objeto de inventario permite obtener su geometria asociada
	 * @param {Integer} objectId Id del inventario del objeto a consultar
	 * @param {Function} success Funcion que es llamada con la geometria obtenida del servidor
	 * @param {Function} error (optional) Function que es llamada en caso de error
	 */
	getGeom: function(objectId, success, error) {
		this.lastRequest = this.mkRequest({id:objectId}, success, error, this.opts.server + 'getGeometria/');
	},
	
	/**
	 * Permite abortar la ultima consulta realizada
	 */
	abort: function() {
		if (this.lastRequest) {
			if (this.opts.debug) usig.debug('Inventario: aborting last request.');
			this.lastRequest.abort();
			this.lastRequest = null;
	       	if (typeof(this.opts.afterAbort) == "function") {
	       		this.opts.afterAbort();
	       	}
		} else {
			if (this.opts.debug) usig.debug('Inventario: abort failed. Too late!');			
		}
	}
	
});
	
usig.Inventario.defaults = {
	debug: false,
	server: 'http://inventario.usig.buenosaires.gob.ar/publico/',
	// server: 'http://inventario.asi.buenosaires.gov.ar/publico/',
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
}