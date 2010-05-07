// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class AutoCompleter
 * Esta clase implementa un autocompleter de lugares y direcciones para inputs de texto.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 1.0+, Normalizador de Direcciones 1.0+, usig.Inventario 2.0+, usig.GeoCoder 2.0+
 * Ejemplo de uso:
 * <pre><code>
 * ...
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * // El usig.AutoCompleterFull.min.js ya tiene todos los componentes necesarios con excepcion de jQuery
 * &lt;script src="http:&#47;&#47;usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/usig.AutoCompleterFull.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var ac = new usig.AutoCompleter('inputField', {
 *              afterSelection: function(option) {
 * 					...
 *              }
 *          });
 * 
 * </code></pre> 
 * Demo: <a href="http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/demos/autoCompleter.html">http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/demo/autoCompleter.html</a><br/>
 * Documentaci&oacute;n: <a href="http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/doc/">http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/doc/</a>
 * @namespace usig
 * @cfg {Integer} minTextLength Longitud minima que debe tener el texto de entrada antes de buscar sugerencias. Por defecto: 3.
 * @cfg {Integer} inputPause Minima pausa (en milisegundos) que debe realizar el usuario al tipear para que se actualicen las sugerencias. Por defecto: 1000.
 * @cfg {Integer} serverTimeout Tiempo de maximo de espera antes de reintentar un pedido al servidor. Por defecto: 5000.
 * @cfg {Integer} maxRetries Maximo numero de reintentos al servidor ante una falla. Por defecto: 10.
 * @cfg {Integer} maxOptions Maximo numero de opciones a mostrar como sugerencia. Por defecto: 10.
 * @cfg {Function} afterSuggest Callback que es llamada cada vez que se actualizan las sugerencias.
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} afterSelection Callback que es llamada cada vez que el usuario selecciona una opcion de la lista de 
 * sugerencias. El objeto que recibe como parametro puede ser una instancia de usig.Calle, usig.Direccion o bien usig.inventario.Objeto
 * @cfg {Function} beforeGeoCoding Callback que es llamada antes de realizar la geocodificacion de la direccion o el lugar 
 * @cfg {Function} afterGeoCoding Callback que es llamada al finalizar la geocodificacion de la direccion o el lugar 
 * seleccionado. El objeto que recibe como parametro es una instancia de usig.Punto
 * @cfg {Boolean} autoSelect Seleccionar automaticamente la sugerencia ofrecida en caso de que sea unica.
 * @cfg {Integer} autoHideTimeout Tiempo de espera (en ms) antes de ocultar las sugerencias si el usuario no realizar ninguna accion sobre el control. Por defecto: 5000.
 * @cfg {Boolean} useInventario Usar el inventario para buscar lugares de interes.
 * @cfg {Boolean} acceptSN Indica si debe permitir como altura S/N para las calles sin numeracion oficial. Por defecto es <code>True</code>. Ej: de los italianos s/n.
 * @constructor 
 * @param {String} idField Identificador del input control en la pagina
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
 * @param {Object} viewCtrl (optional) Controlador de la vista para mostrar las sugerencias del autocompleter
*/	
usig.AutoCompleter = function(idField, options, viewCtrl) {
	var field = document.getElementById(idField), 
		view = viewCtrl,
		opts = $.extend({}, usig.AutoCompleter.defaults, options),
		ic = null,
		inputTimer = null,
		inputTimerServerSearch = null,
		serverTimeout = null,
		numRetries = 0,
		focused = true,
		errorNormalizacion = null,
		resNormalizacion = [],
		lugaresEncontrados = [],
		cleanList = [];
		
	field.setAttribute("autocomplete","off");
		
	/**
	 * Elimina los manejadores de eventos del control 
    */		
	this.unbind = function() {
		ic.unbind();
		if (inputTimer)
			clearTimeout(inputTimer);
		if (inputTimerServerSearch)
			clearTimeout(inputTimerServerSearch);
		if (serverTimeout) {
			clearTimeout(serverTimeout);
			opts.inventario.abort();
		}
		view.remove();
	}
	
	/**
	 * Setea los manejadores de eventos sobre el control 
    */		
	this.bind = function() {
		ic.bind();
	}

	/**
	 * Elimina los bindings y destruye los componentes creados. 
	 */
	this.destroy = function() {
		this.unbind();
		delete ic;
		for (var i=0; i<cleanList.length; i++)
			delete cleanList[i];		
	}
	
	/**
	 * Setea el control de visualizacion de sugerencias
	 * @param {Object} viewCtrl Controlador de la vista para mostrar las sugerencias del autocompleter
    */	
	this.setViewControl = function(viewCtrl) {
		view = viewCtrl;
		view.onSelection(selectionHandler.createDelegate(this));
	}
	
	/**
	 * Setea las opciones del componente
     * @param {Object} options Un objeto conteniendo overrides para las opciones disponibles 
    */	
	this.setOptions = function(options) {
		opts = $.extend({}, opts, options);
		view.setOptions(options);
		opts.inventario.setOptions({ debug: opts.debug });
		opts.geoCoder.setOptions({ debug: opts.debug });
		opts.normalizadorDirecciones.setOptions({ aceptarCallesSinAlturas: opts.acceptSN });
	}
	
	/**
	 * Cambia el skin actual del control
	 * @param {String} newSkin Nombre del skin a aplicar (las opciones son 'usig', 'mapabsas' o 'dark')
	 */
	this.changeSkin = function(newSkin) {
		view.changeSkin(newSkin);
	}
	
	/**
	 * Devuelve las opciones vigentes en el componente
     * @return {Object} Objeto conteniendo las opciones vigentes en el componente  
    */	
	this.getOptions = function() {
		return opts;
	}
	
	/**
	 * Fuerza la selección de la opcion indicada
	 * @param {Integer} num Numero de opcion a seleccionar (entre 0 y el numero de opciones visibles)
	 * @return {Boolean} Devuelve <code>true</code> en caso de exito y <code>false</code> en caso de que no haya opciones disponibles 
	 */
	this.selectOption = function(num) {
		return view.selectOption(num);
	}
	
	function buscarEnInventario(str) {
		if (opts.useInventario) {
			// Solo busca en el inventario si hay lugar para mostrar mas opciones
			var limit = opts.maxOptions;
			if (resNormalizacion && resNormalizacion.length) {
				limit = opts.maxOptions - resNormalizacion.length;
			} 
			if (limit > 0) {
				if (opts.debug) usig.debug('inventario.buscar');
				lugaresEncontrados = [];
				opts.inventario.buscar(str, mostrarLugares.createDelegate(this, [str], 1), function(){}, { limit: limit });
				serverTimeout = retry.defer(opts.serverTimeout, this, [str]);
				if (typeof(opts.afterServerRequest) == "function") {
					if (opts.debug) usig.debug('afterServerRequest');
					opts.afterServerRequest();
				}
			} else {
				if (opts.debug) usig.debug('not searching inventario, limit reached');				
			}
		}		
	}
	
	function normalizar(str) {
		try {
			if (opts.debug) if (opts.debug) usig.debug('normalizar("'+str+'")');
			errorNormalizacion = null;
			resNormalizacion = opts.normalizadorDirecciones.normalizar(str);
			if (opts.debug) usig.debug('view.show');
			view.show(resNormalizacion);
			if (!focused)
				view.hide();
			if (typeof(opts.afterSuggest) == "function") {
				if (opts.debug) usig.debug('afterSuggest');
				opts.afterSuggest();
			}
		} catch(error) {
			if (opts.debug) usig.debug(error);
			resNormalizacion = null;
			errorNormalizacion = error;
			mostrarErrorNormalizacion();
		}
	}
	
	function retry(str) {
		if (opts.debug) usig.debug('retrying...');
		if (typeof(opts.inventario.abort) == "function") {
			abort();
			opts.inventario.buscar(str);
			numRetries++;
			if (numRetries < opts.maxRetries) { 
				serverTimeout = retry.defer(opts.serverTimeout, this, [str]);
			} else {
				if (opts.debug) usig.debug('maxRetries reached. stopping.');
				numRetries = 0;
			}
			if (typeof(opts.afterRetry) == "function") {
				if (opts.debug) usig.debug('afterRetry');
				opts.afterRetry();
			}
		}
	}
	
	function mostrarLugares(lugares, inputStr) {
		clearTimeout(serverTimeout);
		if (lugares instanceof Array && lugares.length > 0) {
			lugaresEncontrados = lugares;
			if (opts.debug) usig.debug('view.show');
			if (errorNormalizacion) 
				view.update(inputStr);
			view.show(lugares, true);			
			if (!focused)
				view.hide();
			if (typeof(opts.afterSuggest) == "function") {
				if (opts.debug) usig.debug('afterSuggest');
				opts.afterSuggest();
			}
		} else if (errorNormalizacion != null) {
			// El error en la normalizacion solo se muestra si no 
			// se encuentra ningun lugar
			mostrarErrorNormalizacion();
		}
		if (typeof(opts.afterServerResponse) == "function") {
			if (opts.debug) usig.debug('afterServerResponse');
			opts.afterServerResponse();
		}
	}
	
	function mostrarErrorNormalizacion() {
		try {
			view.showMessage(errorNormalizacion.getErrorMessage());
		} catch(e) {
			view.showMessage(opts.texts.nothingFound);
		}
		if (typeof(opts.afterSuggest) == "function") {
			if (opts.debug) usig.debug('afterSuggest');
			opts.afterSuggest();
		}		
	}
	
	function abortIfNecessary() {
		if (serverTimeout) {
			clearTimeout(serverTimeout);
			abort();
		}		
	}
	
	function abort() {
		if (opts.debug) usig.debug('inventario.abort');					
		opts.inventario.abort();
		if (typeof(opts.afterAbort) == "function") {
			if (opts.debug) usig.debug('afterAbort');
			opts.afterAbort();
		}		
	}
	
	function selectionHandler(option) {
		if (opts.debug) usig.debug('usig.AutoCompleter: selection');
		abortIfNecessary();
		var newValue = option.toString()+((option instanceof usig.Calle)?' ':'');
		if (opts.debug) usig.debug('usig.AutoCompleter: setting new value');
		ic.setValue(newValue);
		if (typeof(opts.afterSelection) == "function") {
			if (opts.debug) usig.debug('usig.AutoCompleter: calling afterSelection');
			opts.afterSelection(option);
		}
		if (typeof(opts.afterGeoCoding) == "function") {
			if (option instanceof usig.Direccion) {
				if (typeof(opts.beforeGeoCoding) == "function") {
					if (opts.debug) usig.debug('usig.AutoCompleter: calling beforeGeoCoding');
					opts.beforeGeoCoding();
				}
				if (opts.debug) usig.debug('usig.AutoCompleter: geoCoding usig.Direccion');	
				try {
					opts.geoCoder.geoCodificarDireccion(option, opts.afterGeoCoding, (function(error) {
						if (opts.debug) usig.debug(error);
					}).createDelegate(this));
				} catch(error) {
					if (opts.debug) usig.debug(error);
				}
			} else if (option instanceof usig.inventario.Objeto) {
				if (typeof(opts.beforeGeoCoding) == "function") {
					if (opts.debug) usig.debug('usig.AutoCompleter: calling beforeGeoCoding');
					opts.beforeGeoCoding();
				}
				if (opts.debug) usig.debug('usig.AutoCompleter: geoCoding usig.inventario.Objeto');
				opts.inventario.getObjeto(option, afterObjGeoCoding.createDelegate(this), (function(error) {
						if (opts.debug) usig.debug(error);
					}).createDelegate(this));
			}
		}
	}
	
	function afterObjGeoCoding(obj) {
		if (opts.debug) usig.debug('usig.AutoCompleter: afterGeoCoding usig.inventario.Objeto');
		if (obj.direccionAsociada) {
			opts.afterGeoCoding(obj.direccionAsociada.getCoordenadas());
		} else if (obj.ubicacion) {
			opts.afterGeoCoding(obj.ubicacion.getCentroide());
		}
	}
	
	function optionsFormatter(item, linkName, wordMarker) {
		if (item instanceof usig.inventario.Objeto) {
			return '<li><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a><span class="clase">('+item.clase.getNombre()+')</span></li>';
		} else if (item instanceof usig.Calle) {
			return '<li><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a></li>';
		} else {
			return '<li><a href="#" class="acv_op" name="'+linkName+'"><span class="tl"/><span class="tr"/><span>'+wordMarker(item.toString())+'</span></a></li>';			
		}
	}
	
	// Inicializacion
	try {
		ic = new usig.InputController(idField, {
			onKeyUp: function(keyCode, newValue) {
				if (opts.debug) usig.debug('view.keyUp');
				view.keyUp(keyCode);
			},
			onChange: function(newValue) {
				try {
					if (opts.debug) usig.debug('view.update: '+newValue);
					abortIfNecessary();
					view.update(newValue);
				} catch(error) {
					throw(error);
				}
				if (inputTimer) {
					clearTimeout(inputTimer);
				}
				if (inputTimerServerSearch) {
					clearTimeout(inputTimerServerSearch);
				}
				if (newValue.length >= opts.minTextLength) {
					inputTimer = normalizar.defer(opts.inputPause, this, [newValue]);
					inputTimerServerSearch = buscarEnInventario.defer(opts.inputPauseBeforeServerSearch, this, [newValue]);
				}
			},
			onBlur: function() {
				focused = false;
				view.hide.defer(300); // Esto es increible pero hay que diferirlo porque parece que el blur se dispara primero que el click
			},
			onFocus: function() {
				focused = true;
			},
			debug: opts.debug
		});
	} catch(error) {
		throw(error);
	}
	
	if (!opts.normalizadorDirecciones) {
		opts.normalizadorDirecciones = new usig.NormalizadorDirecciones({ aceptarCallesSinAlturas: opts.acceptSN });
		cleanList.push(opts.normalizadorDirecciones);
	}
	
	if (!opts.inventario && opts.useInventario) {
		opts.inventario = new usig.Inventario({ debug: opts.debug });
		cleanList.push(opts.inventario);
	}
	
	if (!opts.geoCoder) {
		opts.geoCoder = new usig.GeoCoder({ debug: opts.debug });
		cleanList.push(opts.geoCoder);
	}
	
	if (!view) {
		view = new usig.AutoCompleterView(idField, { rootUrl: opts.rootUrl, debug: opts.debug, skin: opts.skin, autoSelect: opts.autoSelect, autoHideTimeout: opts.autoHideTimeout, optionsFormatter: optionsFormatter });
		cleanList.push(view);
	}
	
	view.onSelection(selectionHandler.createDelegate(this));
}

usig.AutoCompleter.defaults = {
	minTextLength: 3,
	inputPause: 10,
	inputPauseBeforeServerSearch: 500,
	serverTimeout: 5000,
	useInventario: true,
	autoSelect: true,
	autoHideTimeout: 5000,
	acceptSN: true,
	maxRetries: 5,
	maxOptions: 10,
	rootUrl: 'http://usig.buenosaires.gov.ar/servicios/Usig-JS/2.0/',
	skin: 'usig',
	debug: false,
	texts: {
		nothingFound: 'No se hallaron resultados coincidentes con su búsqueda.'
	}
}