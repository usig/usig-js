// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.debug) == "undefined") {
	usig.debug = function(object) {	
		if (window.console && window.console.log)
				window.console.log(object);
	};	
}

/**
 * @class MapaEstatico
 * Esta funcion permite obtener un mapa estatico de una ubicacion a partir de una serie de parametros que especifican su
 * ubicacion, ancho, alto, radio y demas.<br/>
 * Ejemplo de uso:
 * <pre><code>
 * var img = usig.MapaEstatico({ x: 106983.5920869, y: 103687.499668, marcarPunto: true, width: 600 });
 * $('#div').append(img);
 * </code></pre>
 * @namespace usig
 * @cfg {Float} x Coordenada x del centro del mapa.
 * @cfg {Float} y Coordenada y del centro del mapa.
 * @cfg {usig.Punto} punto Instancia de usig.Punto conteniendo las coordenadas del centro del mapa. Se aplica en caso de no
 * especificarse los parametros x e y.
 * @cfg {String} dir Direccion (en forma "Calle altura" o "Calle y Calle" en la cual centrar el mapa en caso de que no se 
 * hayan especificado ninguno de los parametros anteriores.
 * @cfg {Integer} width (optional) Ancho del mapa a obtener (en pixeles).
 * @cfg {Integer} height (optional) Alto del mapa a obtener (en pixeles).
 * @cfg {Integer} radio (optional) Radio (en metros) alrededor del centro a mostrar en el mapa.
 * @cfg {Boolean} marcarPunto (optional) Determina si se desea que el centro del mapa este marcado con un punto.
 * @cfg {String} desc (optional) Una descripcion a agregar al punto.
 * @cfg {String} smp (optional) Un codigo de seccion-manzana-parcela para pintar la parcela correspondiente en el mapa.
 * @constructor 
 * @param {Object} opts (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.MapaEstatico = function(opts) {
	var mapServer = 'http://servicios.usig.buenosaires.gov.ar/LocDir/mapa.phtml',
		params = new Array(),
		regExpSMP = /[0-9][0-9]-[0-9]{3,3}[A-Z]?-[A-Z0-9]{3,4}/;
	if (typeof(opts.x) != "undefined" && typeof(opts.y) != "undefined" && !isNaN(parseFloat(opts.x)) && !isNaN(parseFloat(opts.y))) {
		params.push('x='+opts.x, 'y='+opts.y);
	} else if (typeof(opts.punto) != "undefined" && opts.punto instanceof usig.Punto) {
		params.push('x='+opts.punto.getX(), 'y='+opts.punto.getY());
	} else if (typeof(opts.dir) != "undefined") {
		params.push('dir='+opts.dir);
	} else {
		if (opts.debug)
			usig.debug('Parametros incorrectos.');
		return;
	}
	if (typeof(opts.width) != "undefined" && !isNaN(parseInt(opts.width))) {
		params.push('w='+parseInt(opts.width));
	}
	if (typeof(opts.height) != "undefined" && !isNaN(parseInt(opts.height))) {
		params.push('h='+parseInt(opts.height));
	}
	if (typeof(opts.radio) != "undefined" && !isNaN(parseInt(opts.radio))) {
		params.push('r='+parseInt(opts.radio));
	}
	if (typeof(opts.marcarPunto) != "undefined" && opts.marcarPunto) {
		params.push('punto='+(opts.marcarPunto?1:0));
	}
	if (typeof(opts.desc) != "undefined") {
		params.push('desc='+opts.desc);
	}
	if (typeof(opts.smp) != "undefined") {
		if (regExpSMP.test(opts.smp)) {
			params.push('smp='+opts.smp);
		} else {
			if (opts.debug)	usig.debug('SMP inválido: '+opts.smp);
		}
	}
	if (typeof(usig.DataManager) != "undefined") {
		if (!usig.DataManager.isRegistered('MapaEstatico')) {
			usig.DataManager.registerClass('MapaEstatico', {
				getter: function (className, id, params) {
					var img = document.createElement('img');
					img.src = mapServer+'?'+params.join('&');
					usig.DataManager.storeData(className, id, img);
					return img;
				}
			});
		}		
		return usig.DataManager.getData('MapaEstatico', params.join('&'), params);
	} else {
		var img = document.createElement('img');
		img.src = mapServer+'?'+params.join('&');
		if (opts.debug)
			usig.debug('Loading: '+img.src);
		return img;
	}
};
