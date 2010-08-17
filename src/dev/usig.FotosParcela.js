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
 * @class FotosParcela
 * Este clase implementa una interfaz Javascript con sistema de administracion de fotos de fachada.<br/>
 * Requiere: jQuery-1.3.2+, usig.core y opcionalmente usig.DataManager.js (para el cache)
 * Ejemplo de uso:
 * <pre><code>
 * ...
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * &lt;script src="http:&#47;&#47;usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/usig.core.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * &lt;script src="http:&#47;&#47;usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/usig.FotosParcela.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var fotosParcela = new usig.FotosParcela(parcela.smp, {maxHeight : 195, maxWidth : 243, onLoad: function() { ... } });
 * fotosParcela.cargarFoto($('div.foto'));
 * ...
 * </code></pre>
 * @namespace usig
 * @cfg {Integer} maxWidth (optional) Maximo ancho por defecto de las fotos a obtener (en pixeles).
 * @cfg {Integer} maxHeight (optional) Maximo alto por defecto de las fotos a obtener (en pixeles).
 * @cfg {Function} onLoad (optional) Funcion callback que es llamada una vez que el componente logro 
 * inicializarse con los datos de las fotos correspondientes a la parcela.
 * @constructor 
 * @param {String} smp Codigo de seccion-manzana-parcela de la parcela cuyas fotos se desean consultar
 * @param {Object} opts (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.FotosParcela = function(smp, opts) {
	var regExpSMP = /[0-9][0-9]-[0-9]{3,3}[A-Z]?-[A-Z0-9]{3,4}/;
	if (typeof(smp) == "undefined" || !regExpSMP.test(smp)) {
		usig.debug('usig.FotosParcela. SMP incorrecto: '+smp);
		return null;
	}
	var options = $.extend(true, {}, usig.FotosParcela.defaults, opts);

	var fotosParcela = null;
	var currentFoto = -1;
	var pendings = new Array();
	var loadListeners = new Array();
	var fotos = {};
	
	if (typeof(options.onLoad) == "function") {
		loadListeners.push(options.onLoad);
	}
	
	if (typeof (usig.DataManager) != "undefined") {	
		// usig.DataManager.setOpts({debug: true});
		if (!usig.DataManager.isRegistered('DatosFotosParcela')) {
			usig.DataManager.registerClass('DatosFotosParcela', {
				ajaxParams: {
					url: usig.FotosParcela.defaults.server+'/getDatosFotos'
				}
			});
		}
		if (!usig.DataManager.isRegistered('FotoParcela')) {
			usig.DataManager.registerClass('FotoParcela', {
				getter: function (className, id, params) {
					var img = document.createElement('img');
					img.src = usig.FotosParcela.defaults.server+'/getFoto?'+params.join('&');
					usig.DataManager.storeData(className, id, img);
					return img;
				}
			});			
		}
		usig.DataManager.getData.defer(100, usig.DataManager, ['DatosFotosParcela', smp, { 
			smp: smp,
			success: initialize.createDelegate(this) 
		}]);
	} else {
		$.ajax({
			type: 'GET',
			url: usig.FotosParcela.defaults.server+'/getDatosFotos',
			data: { 
				smp: smp
			},
			dataType: 'jsonp',
			success: initialize.createDelegate(this),
			error: function(objeto, quepaso){
				usig.debug('Hubo un error al buscar los datos de las fotos: '+quepaso);
        	}
		});		
	}
	
	function initialize(data) {
		if (data) {
			fotosParcela = data;
			if (fotosParcela && fotosParcela.length > 0) {
				currentFoto = 0;
			}
			for (var i=0; i<loadListeners.length; i++) {
				loadListeners[i]();
			}
		}
	};
	
	/**
	 * Carga una foto (asicronicamente) en un contenedor jQuery
     * @param {jQueryObject} $container Contenedor donde se cargara la foto.  
     * @param {Integer} id (optional) Id de la foto a cargar. De lo contrario carga la actual
     * que al inicializar el componente es siempre la mas nueva y luego puede cambiarse llamando a los metodos
     * <code>fotoAnterior()</code> y <code>fotoSiguiente()</code>   
     * @param {Object} opts (optional) Objeto conteniendo overrides para las opciones disponibles (maxWidth, maxHeight, onLoad).
    */		
	this.cargarFoto = function ($container, id, opts) {
		if (fotosParcela || typeof(id) == "undefined") {
			if (currentFoto >= 0 || typeof(id) == "undefined") {
				var params = new Array();				
				var idFoto = optionsToParams(params, id, opts);
				if (pendings.indexOf($container) >= 0) {
					pendings.removeObject($container);
					$container.html('');
				}
				if (typeof (usig.DataManager) != "undefined") {
					var img = null;
					if (usig.DataManager.isCached('FotoParcela', idFoto)) {
						img = usig.DataManager.getData('FotoParcela', idFoto, params);
						$container.append(img);
						if (opts && opts.onLoad && typeof(opts.onLoad) == "function")
							opts.onLoad(img);
					} else {
						img = usig.DataManager.getData('FotoParcela', idFoto, params);
						$container.html('<p>'+usig.FotosParcela.defaults.texts.loadingFoto+'</p>');
						$(img).load((function(opts) {
							$container.html('');
							$container.append(usig.DataManager.getData('FotoParcela', idFoto, params));					
							if (opts && opts.onLoad && typeof(opts.onLoad) == "function")
								opts.onLoad(img);
						}).createDelegate(this));
					}
				} else {
					if (!fotos[idFoto]) {
						var timestamp = new Date();					
						params.push('t='+timestamp);
						fotos[idFoto] = document.createElement('img');
						fotos[idFoto].src = usig.FotosParcela.defaults.server+'/getFoto?'+params.join('&');
						$container.html('<p>'+usig.FotosParcela.defaults.texts.loadingFoto+'</p>');
						$(fotos[idFoto]).load((function(foto) {
							$container.html('');
							$container.append(foto);			
							if (opts.onLoad && typeof(opts.onLoad) == "function")
								opts.onLoad(foto);
						}).createDelegate(this, [fotos[idFoto]]));
					} else {
						$container.append(fotos[idFoto]);
					}
				}
			} else {
				$container.html('<p>'+options.texts.noFotos+'</p>');
			}
		} else {
			if (pendings.indexOf($container) < 0) {
				pendings.push($container);
				$container.html('<p>'+options.texts.loading+'</p>');
			}
			setTimeout(this.cargarFoto.createDelegate(this, [$container, id, opts]), 500);
		}
	};
	
	/**
	 * Devuelve un link a una foto particular
	 * @param {Integer} id Id de la foto a obtener
	 * @param {Object} opts Opciones maxWidth y maxHeight
	 * @return {String} Link a una foto
	 */
	this.getLinkToFoto = function(id, opts) {
		var params = new Array();
		optionsToParams(params, id, opts);
		return usig.FotosParcela.defaults.server+'/getFoto?'+params.join('&');
	}
	
	/**
	 * Setea una funcion callback que es llamada una vez que el componente obtuvo los 
	 * datos correspondientes a las fotos de la parcela elegida
	 * @param {Function} listener Funcion callback a ser llamada
	 */
	this.onLoad = function(listener) {
		if (typeof(listener) == "function") {
			loadListeners.push(listener);
		} else {
			usig.debug('listener debe ser una funcion.');
		}
	};
	
	/**
	 * Devuelve el numero de fotos disponibles para la parcela
	 * @return {Integer} Numero de fotos disponibles para la parcela o -1 si no aun no 
	 * esta inicializado
	 */
	this.numFotos = function() {
		if (fotosParcela) 
			return fotosParcela.length;
		else
			return -1;
	};
	
	/**
	 * Avanza el puntero interno a la foto siguiente en la lista (en forma circular)
	 * @return {Integer} El Id de la foto apuntada
	 */
	this.fotoSiguiente = function() {
		currentFoto = sumaCircular(currentFoto, -1, fotosParcela.length-1);
		return currentFoto;
	};
	
	/**
	 * Retrocede el puntero interno a la foto anterior en la lista (en forma circular)
	 * @return {Integer} El Id de la foto apuntada
	 */
	this.fotoAnterior = function() {
		currentFoto = sumaCircular(currentFoto, 1, fotosParcela.length-1);
		return currentFoto;		
	};
	
	/**
	 * Devuelve la fecha de una foto 
	 * @param {Integer} id El Id de la foto cuya fecha desea conocerse
	 * @return {String} Cadena representando la fecha de la foto o cadena vacia si el id es invalido
	 * o el componente no se encuentra inicializado
	 */
	this.fechaFoto = function(id) {
		if (fotosParcela) {
			if (currentFoto >= 0) {
				if (typeof(id) == "undefined")
					id = currentFoto;
				return fotosParcela[id].fecha;
			} else {
				return '';
			}
		}
	};
	
	/**
	 * Escribe (asincronicamente) la fecha de una foto en un contenedor jQuery
	 * @param {jQueryObject} $container Contenedor jQuery donde escribir la fecha de la foto
	 * @param {Integer} id Id de la foto cuya fecha debe setearse
	 */
	this.setFechaFoto = function($container, id) {
		if (fotosParcela) {
			$container.html(this.fechaFoto(id));
		} else {
			setTimeout(this.setFechaFoto.createDelegate(this, [$container, id]), 1000);
		}		
	};
	
	/**
	 * Obtiene el codigo de seccion-manzana-parcela con que fue inicializado el componente
	 * @return {String} Codigo de seccion-manzana-parcela
	 */
	this.getSMP = function() {
		return smp;
	};
	
	/**
	 * Devuelve los datos disponibles de una foto
	 * @param {Integer} id Identificador de la foto cuyos datos se desean obtener
	 * @return {Object} Datos de la foto o null en caso de Id incorrecto
	 */
	this.getDatosFoto = function(id) {
		if (fotosParcela[id]) {
			return fotosParcela[id];
		}
		return null;
	};
	
	/**
	 * Devuelve la url del servidor de fotos
	 * @return {String} Url del servidor de fotos
	 */
	this.getServerUrl = function() {
		return options.server;
	};
	
	/**
	 * Devuelve la foto apuntada por el puntero interno del componente
	 * @return {Integer} Identificador de la foto apuntada internamente por el componente
	 */
	this.getCurrentFoto = function() {
		return currentFoto;
	};
	
	/**
	 * Devuelve los datos obtenidos del servidor para todas las fotos de la parcela
	 * @return {Object} Datos de las fotos
	 */
	this.getDatosFotos = function() {
		if (fotosParcela) 
			return fotosParcela;
		else
			return {};
	}
	
	function sumaCircular(valor, valorASumar, maximo) {
		var val = valor + valorASumar;
		if (val > maximo)
			val = 0;
		if (val < 0)
			val = maximo;
		return val;
	}
	
	function optionsToParams(params, id, opts) {
		if (typeof(id) == "undefined" && fotosParcela)
			id = currentFoto;
		else if (!fotosParcela || (fotosParcela && !fotosParcela[id]))
			id = 0;
			
		var idFoto = smp+id;
		params.push('smp='+smp, 'i='+id);
		if (typeof(opts) != "undefined" && typeof(opts.maxWidth) != "undefined" && !isNaN(parseInt(opts.maxWidth))) {
			params.push('w='+parseInt(opts.maxWidth));
			idFoto+=opts.maxWidth;
		} else {
			params.push('w='+parseInt(options.maxWidth));
			idFoto+=options.maxWidth;				
		}
		if (typeof(opts) != "undefined" && typeof(opts.maxHeight) != "undefined" && !isNaN(parseInt(opts.maxHeight))) {
			params.push('h='+parseInt(opts.maxHeight));
			idFoto+=opts.maxHeight;
		} else {
			params.push('h='+parseInt(options.maxHeight));
			idFoto+=options.maxHeight;								
		}
		return idFoto;
	}
}

usig.FotosParcela.defaults = {
	server: 'http://fotos.usig.buenosaires.gob.ar/',
	maxWidth: 200,
	maxHeight: 200,
	texts: {
		loading: 'Cargando...',
		loadingFoto: 'Cargando foto...',
		noFotos: 'No hay fotos disponibles para esta parcela.'
	}
}
