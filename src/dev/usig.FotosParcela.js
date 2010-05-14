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
 * Ejemplo de uso:
 * <pre><code>
 * var img = usig.MapaEstatico({ x: 106983.5920869, y: 103687.499668, marcarPunto: true, width: 600 });
 * $('#div').append(img);
 * </code></pre>
 * @namespace usig
 * @cfg {String} smp Codigo de seccion-manzana-parcela de la parcela cuyas fotos se desean consultar
 * @cfg {Integer} width (optional) Ancho por defecto de las fotos a obtener (en pixeles).
 * @cfg {Integer} height (optional) Alto por defecto de las fotos a obtener (en pixeles).
 * @cfg {Function} onLoad (optional) Funcion callback que es llamada una vez que el componente logró 
 * inicializarse con los datos de las fotos correspondientes a la parcela.
 * @constructor 
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
	
	this.cargarFoto = function ($container, id, opts) {
		if (fotosParcela || typeof(id) == "undefined") {
			if (currentFoto >= 0 || typeof(id) == "undefined") {
				var params = new Array();
				if (typeof(id) == "undefined" && fotosParcela)
					id = currentFoto;
				else if (!fotosParcela || (fotosParcela && !fotosParcela[id]))
					id = 0;
					
				var idFoto = smp+id;
				params.push('smp='+smp, 'i='+id);
				if (typeof(opts) != "undefined" && typeof(opts.w) != "undefined" && !isNaN(parseInt(opts.w))) {
					params.push('w='+parseInt(opts.w));
					idFoto+=opts.w;
				} else {
					params.push('w='+parseInt(options.fotoSize.w));
					idFoto+=options.fotoSize.w;				
				}
				if (typeof(opts) != "undefined" && typeof(opts.h) != "undefined" && !isNaN(parseInt(opts.h))) {
					params.push('h='+parseInt(opts.h));
					idFoto+=opts.h;
				} else {
					params.push('h='+parseInt(options.fotoSize.h));
					idFoto+=options.fotoSize.h;								
				}
				if (pendings.indexOf($container) >= 0) {
					pendings.removeObject($container);
					$container.html('');
				}
				if (typeof (usig.DataManager) != "undefined") {
					var img = null;
					if (usig.DataManager.isCached('FotoParcela', idFoto)) {
						img = usig.DataManager.getData('FotoParcela', idFoto, params);
						$container.append(img);
					} else {
						img = usig.DataManager.getData('FotoParcela', idFoto, params);
						$container.html('<p>'+usig.FotosParcela.defaults.texts.loadingFoto+'</p>');
						$(img).load((function() {
							$container.html('');
							$container.append(usig.DataManager.getData('FotoParcela', idFoto, params));					
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
						}).createDelegate(this, [fotos[idFoto]]));
					} else {
						$container.append(fotos[idFoto]);
					}
				}
			} else {
				$container.html('<p>'+usig.FotosParcela.defaults.texts.noFotos+'</p>');
			}
		} else {
			if (pendings.indexOf($container) < 0) {
				pendings.push($container);
				$container.html('<p>'+usig.FotosParcela.defaults.texts.loading+'</p>');
			}
			setTimeout(this.cargarFoto.createDelegate(this, [$container, id, opts]), 500);
		}
	};
	
	this.onLoad = function(listener) {
		if (typeof(listener) == "function") {
			loadListeners.push(listener);
		} else {
			usig.debug('listener debe ser una funcion.');
		}
	};
	
	this.numFotos = function() {
		if (fotosParcela) 
			return fotosParcela.length;
		else
			return -1;
	};
	
	this.fotoSiguiente = function() {
		currentFoto = sumaCircular(currentFoto, -1, fotosParcela.length-1);
		return currentFoto;
	};
	
	this.fotoAnterior = function() {
		currentFoto = sumaCircular(currentFoto, 1, fotosParcela.length-1);
		return currentFoto;		
	};
	
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
	
	this.setFechaFoto = function($container, id) {
		if (fotosParcela) {
			$container.html(this.fechaFoto(id));
		} else {
			setTimeout(this.setFechaFoto.createDelegate(this, [$container, id]), 1000);
		}		
	};
	
	this.getSMP = function() {
		return smp;
	};
	
	this.getDatosFoto = function(id) {
		if (fotosParcela[id]) {
			return fotosParcela[id];
		}
		return null;
	};
	
	this.getCurrentFoto = function() {
		return currentFoto;
	};
	
	function sumaCircular(valor, valorASumar, maximo) {
		var val = valor + valorASumar;
		if (val > maximo)
			val = 0;
		if (val < 0)
			val = maximo;
		return val;
	}
}

usig.FotosParcela.defaults = {
	server: 'http://fotos.usig.buenosaires.gob.ar/',
	fotoSize: {
		w: 200,
		h: 200
	},
	texts: {
		loading: 'Cargando...',
		loadingFoto: 'Cargando foto...',
		noFotos: 'No hay fotos disponibles para esta parcela.'
	}
}