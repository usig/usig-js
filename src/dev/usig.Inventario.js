// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Inventario
 * Esta clase implementa una interfaz Javascript con los servicios del Inventario de Informacion Geografica de la USIG<br/>
 * Requiere: jQuery-1.3.2+, jQuery-jsonp-1.1.0.1+, usig.core, usig.inventario.Objeto, usig.inventario.Ubicacion, usig.inventario.Clase
 * @namespace usig
 * @cfg {String} server Url del servidor de informacion publica del Inventario de Informacion Geografica de USIG. Por defecto: 'http://inventario.usig.buenosaires.gob.ar/mapabsas/'.
 * @cfg {Boolean} debug Mostrar informacion de debugging en la consola. Requiere soporte para window.console.log.
 * @constructor 
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.Inventario = function(options) {
	
	var opts = $.extend({}, usig.Inventario.defaults, options);

	jQuery.jsonp.setup({
		callbackParameter: 'callback',
		pageCache: true,
		dataFilter: function(json) {
     	  return JSON.parse(JSON.stringify(json));
    	}
	});
	
	var mkRequest = function(url, data, success, error) {
		$.jsonp({
			url: url,
			data: data,
			success: success,
			error: error
		});		
	};
	
	var results2Objects = function(results, callback) {
		var clases = {};
		var objetos = [];
		
		$.each(results.clasesEncontradas, function(i, clase) {
			clases[clase.claseId] = new usig.inventario.Clase(clase.claseId, clase.clase);
		});
		
		$.each(results.instancias, function(i, obj) {
			objetos.push(new usig.inventario.Objeto(obj, clases[obj.claseId]));
		});
	}
	
	this.getCategorias = function(success, error) {
		mkRequest(opts.server + 'getCategorias/', {}, success, error);
	}	
	
	this.getParcelaPorDir = function(dir, success, error) {
		mkRequest(opts.server + 'getParcela/', {cod_calle: dir.cod,  altura: dir.alt}, success, error);
	}
	
	this.buscar = function(text, success, error, options) {	
		var ops = $.extend({}, usig.Inventario.defaults.searchOptions, options);
	
		var data = { start:ops.start, limit: ops.limit, texto: text, tipo:ops.tipoBusqueda };
		
		if(ops.categoria != undefined)
			data['categoria'] = ops.categoria;
		
		if(ops.clase != undefined)
			data['clase'] = ops.clase;
		
		if(ops.bbox) { 
			data['bbox'] = [ops.extent.left,ops.extent.bottom,ops.extent.right,ops.extent.top].join(",");
		}
		
		var onSuccess = success;
		
		if (ops.returnObjects) {
			onSuccess = results2Objects.createDelegate(this, [success], 1); 
		}
		
		mkRequest(opts.server + 'buscar/', data, onSuccess, error);
	}	
	
	this.getFeatureInfo = function(id, success, error) {
		if (parseInt(id)) {
			mkRequest(opts.server + 'getObjectContent/', { id: id }, success, error);
		}
	}
		
	this.getGeom = function(objectId, success, error) {
		mkRequest(opts.server + 'getGeometria/', {id:objectId}, success, error);
	}
	
}

usig.Inventario.defaults = {
	debug: false,
	// server: 'http://inventario.usig.buenosaires.gob.ar/mapabsas/',
	server: 'http://inventario.asi.buenosaires.gov.ar/publico/',
	searchOptions: {
		start: 0,
		limit: 20,
		tipoBusqueda: 'ranking',
		categoria: undefined,
		clase: undefined,
		bbox: false,
		extent: undefined,
		returnObjects: false
	}
}